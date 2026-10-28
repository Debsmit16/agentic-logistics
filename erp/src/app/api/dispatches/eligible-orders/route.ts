import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { getEligibleOrdersForDispatch } from "@/lib/dispatches/dispatch-service";

export async function GET() {
  try {
    await requireApiPermission(AppModule.DISPATCHES, "canRead");
    const orders = await getEligibleOrdersForDispatch();
    return NextResponse.json({ orders });
  } catch (e) {
    return jsonError(e);
  }
}

