import { NextResponse } from "next/server";
import { z } from "zod";
import { completeDelivery } from "@/lib/delivery/delivery-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";
import { withIdempotency } from "@/lib/idempotency";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.execute");
    const { id } = await params;
    const body = z
      .object({
        codCollected: z.number().optional(),
        codPaymentMode: z.string().optional(),
        codVarianceReason: z.string().optional(),
        photoBase64: z.string().optional(),
        signatureBase64: z.string().optional(),
        recipientName: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .parse(await request.json());

    const idempotencyKey =
      request.headers.get("idempotency-key") ?? `deliver-${id}-${user.id}`;

    const result = await withIdempotency(
      idempotencyKey,
      24 * 60 * 60 * 1000,
      () =>
        completeDelivery({
          parcelId: id,
          deliveryBoyId: user.id,
          ...body,
        }),
    );

    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
