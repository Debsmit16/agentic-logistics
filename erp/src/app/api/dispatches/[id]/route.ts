import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule, DispatchStatus, DispatchType } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { deleteDispatch, getDispatchById, updateDispatch } from "@/lib/dispatches/dispatch-service";

const updateDispatchSchema = z.object({
  status: z.nativeEnum(DispatchStatus).optional(),
  type: z.nativeEnum(DispatchType).optional(),
  originHub: z.string().max(120).optional(),
  destinationHub: z.string().max(120).nullable().optional(),
  vehicleNumber: z.string().min(2).max(30).optional(),
  driverName: z.string().min(2).max(100).optional(),
  driverPhone: z.string().min(8).max(20).optional(),
  notes: z.string().max(300).nullable().optional(),
  addOrderIds: z.array(z.string()).optional(),
  removeOrderIds: z.array(z.string()).optional(),
});

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiPermission(AppModule.DISPATCHES, "canRead");
    const { id } = await context.params;
    const trip = await getDispatchById(id);

    if (!trip) {
      return NextResponse.json({ error: "Dispatch trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireApiPermission(AppModule.DISPATCHES, "canUpdate");
    const { id } = await context.params;
    const json = await req.json();
    const parsed = updateDispatchSchema.parse(json);

    const trip = await updateDispatch(id, parsed, actor.id, actor.displayName);
    return NextResponse.json({ trip });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireApiPermission(AppModule.DISPATCHES, "canDelete");
    const { id } = await context.params;

    await deleteDispatch(id, actor.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}

