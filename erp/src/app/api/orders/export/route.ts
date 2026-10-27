import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { AppModule, OrderStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { getOrdersForExport } from "@/lib/orders/order-service";

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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Agentic Logistics ERP";
    workbook.lastModifiedBy = "Agentic Logistics System";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("Consignment Manifest", {
      views: [{ state: "frozen", ySplit: 3 }],
      properties: { tabColor: { argb: "FF0F172A" } },
    });

    // 1. Title Banner (Row 1)
    worksheet.mergeCells("A1:X1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "AGENTIC LOGISTICS ERP — OFFICIAL CONSIGNMENT MANIFEST";
    titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 36;

    // 2. Metadata Bar (Row 2)
    worksheet.mergeCells("A2:X2");
    const metaCell = worksheet.getCell("A2");
    const genDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    metaCell.value = `Export Manifest Generated on: ${genDate} · Total Consignments: ${orders.length} · Autonomous Freight Pipeline`;
    metaCell.font = { name: "Segoe UI", size: 9.5, italic: true, color: { argb: "FF334155" } };
    metaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    metaCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 24;

    // 3. Header Columns (Row 3)
    const headers = [
      "Order Number",
      "AWB Number",
      "Status",
      "Payment Mode",
      "Service Category",
      "Item Description",
      "Dead Wt (KG)",
      "Vol Wt (KG)",
      "Chargeable Wt (KG)",
      "Sender Name",
      "Sender Phone",
      "Sender Address",
      "Sender City",
      "Sender State",
      "Sender PIN",
      "Receiver Name",
      "Receiver Phone",
      "Receiver Address",
      "Receiver City",
      "Receiver State",
      "Receiver PIN",
      "Tariff Amount (INR)",
      "Declared Value (INR)",
      "Booking Date (UTC)",
    ];

    const headerRow = worksheet.getRow(3);
    headerRow.values = headers;
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "medium", color: { argb: "FF0F172A" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });

    // 4. Data Rows
    orders.forEach((o, index) => {
      const rowIdx = index + 4;
      const isEven = index % 2 === 1;

      const rowData = [
        o.orderNumber,
        o.awbNumber,
        o.status,
        o.paymentMode,
        o.serviceType,
        o.itemDescription,
        o.packageWeight,
        o.volumetricWeight,
        o.chargeableWeight,
        o.senderName,
        o.senderPhone,
        o.senderAddress,
        o.senderCity,
        o.senderState,
        o.senderPincode,
        o.receiverName,
        o.receiverPhone,
        o.receiverAddress,
        o.receiverCity,
        o.receiverState,
        o.receiverPincode,
        o.totalAmount,
        o.declaredValue,
        o.createdAt.toISOString().replace("T", " ").slice(0, 19),
      ];

      const row = worksheet.addRow(rowData);
      row.height = 22;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Segoe UI", size: 9.5 };
        cell.alignment = { vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        if (isEven) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        }

        // Center specific codes
        if ([1, 2, 4, 5, 11, 15, 17, 21, 24].includes(colNumber)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }

        // Numbers & Currencies
        if ([7, 8, 9].includes(colNumber)) {
          cell.numFmt = "0.00";
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }
        if ([22, 23].includes(colNumber)) {
          cell.numFmt = "₹#,##0.00";
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }

        // Status Badge Styling (Column 3)
        if (colNumber === 3) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          const st = String(o.status);
          if (st === OrderStatus.DELIVERED) {
            cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FF166534" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
          } else if (st === OrderStatus.IN_TRANSIT || st === OrderStatus.OUT_FOR_DELIVERY) {
            cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FF1E40AF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
          } else if (st === OrderStatus.CANCELLED || st === OrderStatus.RTO) {
            cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FF991B1B" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
          } else {
            cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FF92400E" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
          }
        }
      });
    });

    // 5. Explicit Column Widths
    const colWidths = [
      18, // A: Order Number
      18, // B: AWB Number
      18, // C: Status
      16, // D: Payment Mode
      18, // E: Service Category
      28, // F: Item Description
      15, // G: Dead Wt
      15, // H: Vol Wt
      18, // I: Chargeable Wt
      24, // J: Sender Name
      18, // K: Sender Phone
      36, // L: Sender Address
      18, // M: Sender City
      18, // N: Sender State
      14, // O: Sender PIN
      24, // P: Receiver Name
      18, // Q: Receiver Phone
      36, // R: Receiver Address
      18, // S: Receiver City
      18, // T: Receiver State
      14, // U: Receiver PIN
      20, // V: Tariff Amount
      20, // W: Declared Value
      22, // X: Booking Date
    ];

    colWidths.forEach((w, idx) => {
      worksheet.getColumn(idx + 1).width = w;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `agentic_manifest_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
