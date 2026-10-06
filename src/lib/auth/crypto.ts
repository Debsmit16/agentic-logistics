import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "al_session";
const SESSION_DAYS = 14;

export { SESSION_COOKIE, SESSION_DAYS };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

export function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
