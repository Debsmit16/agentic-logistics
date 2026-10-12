import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ApiAuthError } from "@/lib/permissions";

export function jsonError(e: unknown) {
  if (e instanceof ApiAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A record with that value already exists." }, { status: 409 });
    }
    if (e.code === "P2025") {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
  }
  if (e instanceof Error) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Request failed" }, { status: 500 });
}
