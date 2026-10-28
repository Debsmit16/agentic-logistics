import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export const RIDER_COOKIE = "al_rider_session";

function getSecretKey() {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "agentic_logistics_rider_jwt_secret_key_2026_production";
  return new TextEncoder().encode(secret);
}

export interface RiderSessionData {
  driverPhone: string;
  driverName: string;
  vehicleNumber?: string;
  userId?: string;
}

export async function createRiderSession(data: RiderSessionData) {
  const token = await new SignJWT({
    driverName: data.driverName,
    vehicleNumber: data.vehicleNumber,
    userId: data.userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(data.driverPhone)
    .setIssuedAt()
    .setExpirationTime("30d") // 30 days session for field phones
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(RIDER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getRiderSession(): Promise<RiderSessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(RIDER_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.sub !== "string") return null;

    return {
      driverPhone: payload.sub,
      driverName: String(payload.driverName || "Driver"),
      vehicleNumber: typeof payload.vehicleNumber === "string" ? payload.vehicleNumber : undefined,
      userId: typeof payload.userId === "string" ? payload.userId : undefined,
    };
  } catch {
    return null;
  }
}

export async function clearRiderSession() {
  const cookieStore = await cookies();
  cookieStore.delete(RIDER_COOKIE);
}

