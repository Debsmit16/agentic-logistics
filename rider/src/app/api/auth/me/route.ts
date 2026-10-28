import { NextResponse } from "next/server";
import { getRiderSession, clearRiderSession } from "@/lib/auth";

export async function GET() {
  const session = await getRiderSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, rider: session });
}

export async function POST() {
  await clearRiderSession();
  return NextResponse.json({ ok: true });
}

