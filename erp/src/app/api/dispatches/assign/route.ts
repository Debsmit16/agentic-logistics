import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { updateDispatch } from "@/lib/dispatches/dispatch-service";

const assignSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  orderIds: z.array(z.string()).min(1, "At least one order must be selected"),
});

export async function POST(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.DISPATCHES, "canUpdate");
    const json = await req.json();
    const { tripId, orderIds } = assignSchema.parse(json);

    const trip = await updateDispatch(
      tripId,
      { addOrderIds: orderIds },
      actor.id,
      actor.displayName,
    );

    return NextResponse.json({ ok: true, trip });
  } catch (e) {
    return jsonError(e);
  }
}

