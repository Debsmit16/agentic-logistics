import { AppModule } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/crypto";
import { logAudit } from "@/lib/audit/log-audit";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: { select: { id: true, name: true } } },
  });
}

export async function createUser(
  input: {
    email: string;
    displayName: string;
    password: string;
    roleId: string;
    phone?: string | null;
  },
  actorId: string,
) {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      displayName: input.displayName.trim(),
      phone: input.phone?.trim() || null,
      passwordHash,
      roleId: input.roleId,
    },
    include: { role: { select: { id: true, name: true } } },
  });

  await logAudit({
    action: "USER_CREATE",
    module: AppModule.USERS,
    entityId: user.id,
    userId: actorId,
    newValues: { email: user.email, roleId: user.roleId },
  });

  return user;
}

export async function updateUser(
  id: string,
  input: {
    displayName?: string;
    phone?: string | null;
    roleId?: string;
    isActive?: boolean;
    password?: string;
  },
  actorId: string,
) {
  const data: {
    displayName?: string;
    phone?: string | null;
    roleId?: string;
    isActive?: boolean;
    passwordHash?: string;
  } = {};

  if (input.displayName !== undefined) data.displayName = input.displayName.trim();
  if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
  if (input.roleId !== undefined) data.roleId = input.roleId;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) data.passwordHash = await hashPassword(input.password);

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { role: { select: { id: true, name: true } } },
  });

  await logAudit({
    action: "USER_UPDATE",
    module: AppModule.USERS,
    entityId: user.id,
    userId: actorId,
    newValues: { roleId: user.roleId, isActive: user.isActive },
  });

  return user;
}
