import { NextResponse } from "next/server";
import { z } from "zod";
import { createRack } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireApiPermission("warehouses.manage");
    const { id: zoneId } = await params;
    const body = z
      .object({ code: z.string().min(1), name: z.string().optional() })
      .parse(await request.json());
    const rack = await createRack(zoneId, body.code, body.name);
    return NextResponse.json({ rack });
  } catch (e) {
    return handleApiError(e);
  }
}
