import { NextResponse } from "next/server";
import { z } from "zod";
import { createZone } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireApiPermission("warehouses.manage");
    const { id: warehouseId } = await params;
    const body = z
      .object({ code: z.string().min(1), name: z.string().min(1) })
      .parse(await request.json());
    const zone = await createZone(warehouseId, body.code, body.name);
    return NextResponse.json({ zone });
  } catch (e) {
    return handleApiError(e);
  }
}
