import { NextResponse } from "next/server";
import { z } from "zod";
import { createWarehouse, listWarehouses } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    const user = await requireApiPermission("parcels.read");
    if (user.role === "OWNER" || user.role === "ADMIN") {
      const warehouses = await listWarehouses();
      return NextResponse.json({ warehouses });
    }
    if (!user.warehouseId) {
      return NextResponse.json({ warehouses: [] });
    }
    const warehouses = await listWarehouses();
    return NextResponse.json({
      warehouses: warehouses.filter((w) => w.id === user.warehouseId),
    });
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireApiPermission("warehouses.manage");
    const body = createSchema.parse(await request.json());
    const warehouse = await createWarehouse(body);
    return NextResponse.json({ warehouse });
  } catch (e) {
    return handleApiError(e);
  }
}
