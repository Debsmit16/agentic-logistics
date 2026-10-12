import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { logAudit } from "@/lib/audit/log-audit";
import { hashPassword, verifyPassword } from "@/lib/auth/crypto";

export async function GET() {
  try {
    const user = await requireApiPermission(AppModule.PROFILE, "canRead");
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        role: user.role?.name,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

const patchSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  phone: z.string().max(20).optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: Request) {
  try {
    const sessionUser = await requireApiPermission(AppModule.PROFILE, "canUpdate");
    const body = patchSchema.parse(await req.json());

    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Current password required" }, { status: 400 });
      }
      const full = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
      const ok = await verifyPassword(body.currentPassword, full.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        displayName: body.displayName,
        phone: body.phone,
        ...(body.newPassword ? { passwordHash: await hashPassword(body.newPassword) } : {}),
      },
      include: { role: true },
    });

    await logAudit({
      action: "UPDATE_PROFILE",
      module: AppModule.PROFILE,
      entityId: updated.id,
      newValues: { displayName: updated.displayName, phone: updated.phone },
      userId: updated.id,
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        phone: updated.phone,
        role: updated.role?.name,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
