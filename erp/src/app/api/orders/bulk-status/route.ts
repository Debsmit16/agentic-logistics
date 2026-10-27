import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule, OrderStatus } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { bulkUpdateOrderStatus } from "@/lib/orders/order-service";

const bulkStatusSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1, "At least 1 order must be selected"),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().max(250).optional(),
  location: z.string().max(100).optional(),
});

export async function PATCH(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.ORDERS, "canUpdate");
    const json = await req.json();
    const parsed = bulkStatusSchema.parse(json);

    const result = await bulkUpdateOrderStatus(parsed.orderIds, parsed.status, {
      notes: parsed.notes,
      location: parsed.location,
      actorId: actor.id,
      actorName: actor.displayName,
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.updatedCount,
    });
  } catch (e) {
    return jsonError(e);
  }
}
