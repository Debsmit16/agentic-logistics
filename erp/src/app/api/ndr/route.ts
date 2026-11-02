import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { getNdrOrders, resolveNdrAction, NdrActionType } from "@/lib/ndr/ndr-service";

export async function GET() {
  try {
    await requireApiPermission(AppModule.ORDERS, "canRead");
    const ndrOrders = await getNdrOrders();
    return NextResponse.json({ ndrOrders });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiPermission(AppModule.ORDERS, "canUpdate");
    const body = await req.json().catch(() => ({}));
    const { orderId, action, preferredDate, preferredSlot, notes } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
    }

    const validActions: NdrActionType[] = ["REATTEMPT", "RTO", "RESCHEDULE"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await resolveNdrAction({
      orderId,
      action,
      preferredDate,
      preferredSlot,
      notes,
      userId: user.id,
      userDisplayName: user.displayName,
    });

    return NextResponse.json({ result });
  } catch (e) {
    return jsonError(e);
  }
}

