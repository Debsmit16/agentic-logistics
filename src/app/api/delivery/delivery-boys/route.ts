import { NextResponse } from "next/server";
import { listDeliveryBoys } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET(request: Request) {
  try {
    const user = await requireApiPermission("delivery.manage");
    const warehouseId = new URL(request.url).searchParams.get("warehouseId") ?? user.warehouseId ?? undefined;
    const deliveryBoys = await listDeliveryBoys(warehouseId ?? undefined);
    return NextResponse.json({ deliveryBoys });
  } catch (e) {
    return handleApiError(e);
  }
}
