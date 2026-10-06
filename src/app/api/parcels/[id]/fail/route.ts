import { NextResponse } from "next/server";
import { z } from "zod";
import { failDelivery } from "@/lib/delivery/delivery-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.execute");
    const { id } = await params;
    const body = z
      .object({
        failureReasonId: z.string(),
        failureNote: z.string().optional(),
      })
      .parse(await request.json());
    await failDelivery({
      parcelId: id,
      deliveryBoyId: user.id,
      ...body,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
