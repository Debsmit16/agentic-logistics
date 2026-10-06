import { NextResponse } from "next/server";
import { sortParcel } from "@/lib/parcels/parcel-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("parcels.store");
    const { id } = await params;
    const parcel = await sortParcel(id, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
