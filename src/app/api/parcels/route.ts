import { NextResponse } from "next/server";
import { z } from "zod";
import { PaymentType } from "@prisma/client";
import { createParcel } from "@/lib/parcels/parcel-service";
import { listParcels } from "@/lib/partners/import-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET(request: Request) {
  try {
    await requireApiPermission("parcels.read");
    const url = new URL(request.url);
    const result = await listParcels({
      q: url.searchParams.get("q") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      page: Number(url.searchParams.get("page") ?? 1),
    });
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  partnerId: z.string(),
  partnerAwb: z.string().min(1),
  receiverName: z.string().min(1),
  receiverPhone: z.string().min(8),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  paymentType: z.nativeEnum(PaymentType).optional(),
  codAmount: z.number().optional(),
  warehouseId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiPermission("parcels.receive");
    const body = createSchema.parse(await request.json());
    const parcel = await createParcel(body, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    return handleApiError(e);
  }
}
