import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ParcelStatus } from "@prisma/client";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("reports.view");
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const aging = await prisma.parcel.findMany({
      where: {
        status: { notIn: [ParcelStatus.DELIVERED, ParcelStatus.CANCELLED] },
        createdAt: { lt: cutoff },
      },
      select: { internalId: true, status: true, createdAt: true, partnerAwb: true },
      take: 100,
    });
    return NextResponse.json({ aging });
  } catch (e) {
    return handleApiError(e);
  }
}
