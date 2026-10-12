import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { updateUser } from "@/lib/users/user-service";

const patchSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  phone: z.string().max(32).optional().nullable(),
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireApiPermission(AppModule.USERS, "canUpdate");
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());
    const user = await updateUser(id, body, actor.id);
    return NextResponse.json({ user });
  } catch (e) {
    return jsonError(e);
  }
}
