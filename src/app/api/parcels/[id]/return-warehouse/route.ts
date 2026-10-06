import { NextResponse } from "next/server";
import { markReturnToWarehouse } from "@/lib/parcels/return-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.manage");
    const { id } = await params;
    const parcel = await markReturnToWarehouse(id, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
