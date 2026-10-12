import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { createUser, listUsers } from "@/lib/users/user-service";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireApiPermission(AppModule.SETTINGS, "canRead");
    const [users, roles] = await Promise.all([listUsers(), prisma.role.findMany({ orderBy: { name: "asc" } })]);
    return NextResponse.json({ users, roles });
  } catch (e) {
    return jsonError(e);
  }
}

const createSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(120),
  password: z.string().min(6),
  roleId: z.string().min(1),
  phone: z.string().max(32).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.USERS, "canCreate");
    const body = createSchema.parse(await req.json());
    const user = await createUser(body, actor.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
