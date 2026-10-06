import { NextResponse } from "next/server";
import { scheduleReattempt } from "@/lib/parcels/return-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.manage");
    const { id } = await params;
    const parcel = await scheduleReattempt(id, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
