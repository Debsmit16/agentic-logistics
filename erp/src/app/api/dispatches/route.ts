import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule, DispatchStatus, DispatchType } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { flagsForModule } from "@/lib/permissions/user-module";
import { jsonError } from "@/lib/api/helpers";
import { createDispatch, listDispatches } from "@/lib/dispatches/dispatch-service";

const createDispatchSchema = z.object({
  type: z.nativeEnum(DispatchType),
  originHub: z.string().max(120).optional(),
  destinationHub: z.string().max(120).optional(),
  vehicleNumber: z.string().min(2, "Vehicle number is required").max(30),
  driverName: z.string().min(2, "Driver name is required").max(100),
  driverPhone: z.string().min(8, "Valid phone number is required").max(20),
  notes: z.string().max(300).optional(),
  orderIds: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.DISPATCHES, "canRead");
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(Math.max(1, Number(url.searchParams.get("limit") ?? 20)), 100);
    const search = url.searchParams.get("search") ?? undefined;
    
    const statusParam = url.searchParams.get("status");
    const status =
      statusParam && Object.values(DispatchStatus).includes(statusParam as DispatchStatus)
        ? (statusParam as DispatchStatus)
        : undefined;

    const typeParam = url.searchParams.get("type");
    const type =
      typeParam && Object.values(DispatchType).includes(typeParam as DispatchType)
        ? (typeParam as DispatchType)
        : undefined;

    const [data, permissions] = await Promise.all([
      listDispatches({ page, limit, search, status, type }),
      flagsForModule(actor.role?.name, AppModule.DISPATCHES),
    ]);

    return NextResponse.json({
      ...data,
      permissions,
      currentUserId: actor.id,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.DISPATCHES, "canCreate");
    const json = await req.json();
    const parsed = createDispatchSchema.parse(json);
    const trip = await createDispatch(parsed, actor.id, actor.displayName);
    return NextResponse.json({ trip }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

