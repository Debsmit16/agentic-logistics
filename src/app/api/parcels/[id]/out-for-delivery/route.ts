import { NextResponse } from "next/server";
import { startOutForDelivery } from "@/lib/delivery/delivery-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("delivery.execute");
    const { id } = await params;
    const attempt = await startOutForDelivery(id, user.id);
    return NextResponse.json({ attempt });
  } catch (e) {
    return handleApiError(e);
  }
}
