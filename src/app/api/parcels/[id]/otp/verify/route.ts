import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyDeliveryOtp } from "@/lib/delivery/delivery-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.execute");
    const { id } = await params;
    const { otp } = z.object({ otp: z.string().length(6) }).parse(await request.json());
    const result = await verifyDeliveryOtp(id, otp, user.id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
