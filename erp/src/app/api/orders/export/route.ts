import { NextResponse } from "next/server";
import { AppModule, OrderStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { getOrdersForExport } from "@/lib/orders/order-service";

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: Request) {
  try {
    await requireApiPermission(AppModule.ORDERS, "canRead");
    const url = new URL(req.url);

    const search = url.searchParams.get("search") ?? undefined;
    const statusParam = url.searchParams.get("status");
    const status =
      statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;

    const orders = await getOrdersForExport({ search, status });

    const headers = [
      "Order Number",
      "AWB Number",
      "Status",
      "Payment Mode",
      "Service Category",
      "Item Description",
      "Dead Weight (KG)",
      "Chargeable Weight (KG)",
      "Sender Name",
      "Sender City",
      "Sender State",
      "Sender PIN",
      "Receiver Name",
      "Receiver Phone",
      "Receiver Address",
      "Receiver City",
      "Receiver State",
      "Receiver PIN",
      "Tariff / Amount (INR)",
      "Declared Value (INR)",
      "Booking Date (UTC)",
    ];

    const rows = orders.map((o) => [
      escapeCsvCell(o.orderNumber),
      escapeCsvCell(o.awbNumber),
      escapeCsvCell(o.status),
      escapeCsvCell(o.paymentMode),
      escapeCsvCell(o.serviceType),
      escapeCsvCell(o.itemDescription),
      escapeCsvCell(o.packageWeight),
      escapeCsvCell(o.chargeableWeight),
      escapeCsvCell(o.senderName),
      escapeCsvCell(o.senderCity),
      escapeCsvCell(o.senderState),
      escapeCsvCell(o.senderPincode),
      escapeCsvCell(o.receiverName),
      escapeCsvCell(o.receiverPhone),
      escapeCsvCell(o.receiverAddress),
      escapeCsvCell(o.receiverCity),
      escapeCsvCell(o.receiverState),
      escapeCsvCell(o.receiverPincode),
      escapeCsvCell(o.totalAmount),
      escapeCsvCell(o.declaredValue),
      escapeCsvCell(o.createdAt.toISOString()),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const filename = `agentic_manifest_${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
