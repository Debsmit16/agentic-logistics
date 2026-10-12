import { NextResponse } from "next/server";
import { ApiAuthError } from "@/lib/permissions";

export function jsonError(e: unknown) {
  if (e instanceof ApiAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof Error) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Request failed" }, { status: 500 });
}
