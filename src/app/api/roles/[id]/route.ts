import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { deleteRole, updateRole } from "@/lib/roles/role-service";

const permSchema = z.object({
  module: z.nativeEnum(AppModule),
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
});

const updateSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  description: z.string().max(256).optional(),
  permissions: z.array(permSchema).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiPermission(AppModule.USERS, "canUpdate");
    const { id } = await ctx.params;
    const body = updateSchema.parse(await req.json());
    const role = await updateRole(id, body, user.id);
    return NextResponse.json({ role });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiPermission(AppModule.USERS, "canDelete");
    const { id } = await ctx.params;
    await deleteRole(id, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
