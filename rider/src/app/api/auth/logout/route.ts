import { NextResponse } from "next/server";
import { clearRiderSession } from "@/lib/auth";

export async function POST() {
  await clearRiderSession();
  return NextResponse.json({ ok: true });
}

