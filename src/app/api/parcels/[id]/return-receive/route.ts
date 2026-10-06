import { NextResponse } from "next/server";
import { z } from "zod";
import { receiveReturnAtWarehouse } from "@/lib/parcels/return-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("parcels.store");
    const { id } = await params;
    const { shelfId } = z.object({ shelfId: z.string() }).parse(await request.json());
    const parcel = await receiveReturnAtWarehouse(id, shelfId, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
