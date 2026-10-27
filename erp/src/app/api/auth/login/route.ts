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
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const started = Date.now();

  try {
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
      module: AppModule.SETTINGS,
      entityId: user.id,
      userId: user.id,
      httpMethod: "POST",
      statusCode: 200,
      requestUrl: "/api/auth/login",
      durationMs: Date.now() - started,
    });

    return NextResponse.json({ redirect: "/dashboard" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message === "AUTH_SECRET_MISSING") {
      return NextResponse.json(
        {
          error:
            "Server is missing AUTH_SECRET (at least 32 characters). Add it in .env.local for dev or in your Vercel project Environment Variables, then redeploy.",
        },
        { status: 503 },
      );
    }
    console.error("[login]", e);
    return NextResponse.json({ error: "Sign-in failed. Check database connection and try again." }, { status: 500 });
  }
}
