import { NextResponse } from "next/server";
import { listShelvesForWarehouse } from "@/lib/admin/admin-service";
import { handleApiError, requireApiUser } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireApiUser();
    const { id } = await params;
    const shelves = await listShelvesForWarehouse(id);
    return NextResponse.json({
      shelves: shelves.map((s) => ({
        id: s.id,
        label: s.label || `${s.rack.zone.code}-${s.rack.code}-${s.code}`,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
