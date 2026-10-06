import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(4),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { identifier, password } = bodySchema.parse(json);

    const user = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Phone/email or password is incorrect." },
        { status: 401 },
      );
    }

    await createSession(user.id);
    await writeAuditLog({
      actorId: user.id,
      action: "auth.login",
      entityType: "User",
      entityId: user.id,
    });

    return NextResponse.json({
      redirect: ROLE_HOME[user.role] ?? "/dashboard",
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't log you in. Please try again." },
      { status: 400 },
    );
  }
}
