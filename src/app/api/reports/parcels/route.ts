import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("reports.view");
    const parcels = await prisma.parcel.findMany({
      include: { partner: { select: { code: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    const header =
      "internalId,partnerAwb,partner,status,paymentType,codAmount,city,pincode,updatedAt\n";
    const rows = parcels
      .map((p) =>
        [
          p.internalId,
          p.partnerAwb,
          p.partner.code,
          p.status,
          p.paymentType,
          p.codAmount.toString(),
          p.city,
          p.pincode,
          p.updatedAt.toISOString(),
        ].join(","),
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="parcels.csv"',
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
