import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log-audit";
import { AppModule } from "@prisma/client";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { role: true },
    });
    if (!user?.isActive || !user.role) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user.id, user.email, user.role.name);
    await logAudit({
      action: "LOGIN",
      module: AppModule.PROFILE,
      entityId: user.id,
      userId: user.id,
    });

    return NextResponse.json({ redirect: "/dashboard" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
