import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role, RolePermission, User } from "@prisma/client";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "al_session";

export type SessionUser = User & {
  role: (Role & { permissions: RolePermission[] }) | null;
};

type SessionPayload = {
  sub: string;
  email: string;
  role: string;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string, email: string, roleName: string) {
  const token = await new SignJWT({ email, role: roleName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(authSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, authSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    const email = payload.email;
    const role = payload.role;
    if (typeof email !== "string" || typeof role !== "string") return null;
    return { sub, email, role };
  } catch {
    return null;
  }
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: { include: { permissions: true } } },
  });
  if (!user?.isActive) return null;
  return user;
});

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
