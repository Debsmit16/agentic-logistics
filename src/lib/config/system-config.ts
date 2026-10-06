import { prisma } from "@/lib/db";
import { createHash, randomBytes } from "crypto";
import { hashPassword } from "@/lib/auth/crypto";
import { sendPasswordResetEmail } from "@/lib/email/send";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateResetToken() {
  return randomBytes(32).toString("hex");
}

export async function createPasswordReset(identifier: string) {
  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });
  if (!user) {
    return { ok: true as const, devResetUrl: null };
  }

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const devResetUrl = `${base}/reset-password?token=${token}`;

  if (user.email) {
    try {
      await sendPasswordResetEmail(user.email, devResetUrl);
    } catch (e) {
      console.error("Password reset email failed:", e);
    }
  }

  return { ok: true as const, devResetUrl };
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!record) throw new Error("This reset link is invalid or expired.");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export async function getSystemConfig<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.systemConfig.findUnique({ where: { key } });
  if (!row) return fallback;
  return row.value as T;
}

export async function setSystemConfig(key: string, value: unknown) {
  return prisma.systemConfig.upsert({
    where: { key },
    create: { key, value: value as object },
    update: { value: value as object },
  });
}

export type PodRequirements = {
  requireOtp: boolean;
  requirePhoto: boolean;
  requireSignature: boolean;
  requireGps: boolean;
};

export const DEFAULT_POD: PodRequirements = {
  requireOtp: true,
  requirePhoto: false,
  requireSignature: false,
  requireGps: false,
};
