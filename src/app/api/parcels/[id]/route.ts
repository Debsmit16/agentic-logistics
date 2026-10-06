import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireApiPermission("parcels.read");
    const { id } = await params;
    const parcel = await prisma.parcel.findUnique({
      where: { id },
      include: {
        partner: true,
        events: { orderBy: { createdAt: "desc" } },
        shelf: { include: { rack: { include: { zone: true } } } },
      },
    });
    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found." }, { status: 404 });
    }
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
