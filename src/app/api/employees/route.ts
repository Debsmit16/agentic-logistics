import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmployee, listEmployees, updateEmployee } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";
import { SystemRole } from "@prisma/client";

export async function GET() {
  try {
    await requireApiPermission("users.manage");
    const employees = await listEmployees();
    return NextResponse.json({ employees });
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(SystemRole),
  password: z.string().min(6),
  warehouseId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiPermission("users.manage");
    const body = createSchema.parse(await request.json());
    const employee = await createEmployee(body, user.id);
    return NextResponse.json({ employee });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiPermission("users.manage");
    const body = z
      .object({
        id: z.string(),
        displayName: z.string().min(1).optional(),
        role: z.nativeEnum(SystemRole).optional(),
        isActive: z.boolean().optional(),
        warehouseId: z.string().nullable().optional(),
        password: z.string().min(6).optional(),
      })
      .parse(await request.json());
    const { id, ...rest } = body;
    const employee = await updateEmployee(id, rest, user.id);
    return NextResponse.json({ employee });
  } catch (e) {
    return handleApiError(e);
  }
}
