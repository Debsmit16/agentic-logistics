import { NextResponse } from "next/server";
import { z } from "zod";
import { returnToPartner } from "@/lib/parcels/return-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.manage");
    const { id } = await params;
    const { reason } = z.object({ reason: z.string().min(1) }).parse(await request.json());
    const parcel = await returnToPartner(id, user.id, reason);
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
