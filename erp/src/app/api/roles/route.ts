import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { createRole, listRoles } from "@/lib/roles/role-service";
import { flagsForModule } from "@/lib/permissions/user-module";

const permSchema = z.object({
  module: z.nativeEnum(AppModule),
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
});

const createSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(256).optional(),
  permissions: z.array(permSchema),
});

export async function GET() {
  try {
    const actor = await requireApiPermission(AppModule.SETTINGS, "canRead");
    const [roles, permissions] = await Promise.all([
      listRoles(),
      flagsForModule(actor.role?.name, AppModule.USERS),
    ]);
    return NextResponse.json({ roles, modules: Object.values(AppModule), permissions });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiPermission(AppModule.USERS, "canCreate");
    const body = createSchema.parse(await req.json());
    const role = await createRole(body, user.id);
    return NextResponse.json({ role }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
