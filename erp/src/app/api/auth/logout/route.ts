import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log-audit";
import { AppModule } from "@prisma/client";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await logAudit({ action: "LOGOUT", module: AppModule.SETTINGS, entityId: user.id, userId: user.id });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
