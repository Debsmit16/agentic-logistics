import { NextResponse } from "next/server";
import type { SystemRole } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError("Please log in again.", 401);
  }
  if (!user.isActive) {
    throw new ApiError("Your account is inactive.", 403);
  }
  return user;
}

export async function requireApiPermission(permission: string) {
  const user = await requireApiUser();
  if (!hasPermission(user.role, permission)) {
    throw new ApiError("You don't have access.", 403);
  }
  return user;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function handleApiError(e: unknown) {
  if (e instanceof ApiError) {
    return jsonError(e.message, e.status);
  }
  if (e instanceof Error) {
    return jsonError(e.message, 400);
  }
  return jsonError("Something went wrong. Please try again.", 500);
}

export const DELIVERY_ROLES: SystemRole[] = [
  "DELIVERY_BOY" as SystemRole,
];
