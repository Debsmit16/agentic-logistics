import { NextResponse } from "next/server";
import { z } from "zod";
import { createShelf } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireApiPermission("warehouses.manage");
    const { id: rackId } = await params;
    const body = z
      .object({ code: z.string().min(1), label: z.string().min(1) })
      .parse(await request.json());
    const shelf = await createShelf(rackId, body.code, body.label);
    return NextResponse.json({ shelf });
  } catch (e) {
    return handleApiError(e);
  }
}
