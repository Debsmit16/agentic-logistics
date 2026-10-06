import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await writeAuditLog({
      actorId: user.id,
      action: "auth.logout",
      entityType: "User",
      entityId: user.id,
    });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
