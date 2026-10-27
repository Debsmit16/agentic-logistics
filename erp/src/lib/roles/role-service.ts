import { AppModule, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit/log-audit";
import { SYSTEM_ADMIN_ROLE } from "@/lib/rbac";

export type PermissionInput = {
  module: AppModule;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export async function listRoles() {
  return prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createRole(
  input: { name: string; description?: string; permissions: PermissionInput[] },
  actorId: string,
) {
  if (input.name === SYSTEM_ADMIN_ROLE) {
    throw new Error("Cannot create a role named System Admin.");
  }
  const role = await prisma.$transaction(async (tx) => {
    const created = await tx.role.create({
      data: { name: input.name.trim(), description: input.description?.trim() },
    });
    await tx.rolePermission.createMany({
      data: input.permissions.map((p) => ({ ...p, roleId: created.id })),
    });
    return created;
  });

  await logAudit({
    action: "CREATE_ROLE",
    module: AppModule.SETTINGS,
    entityId: role.id,
    newValues: input as unknown as Prisma.InputJsonValue,
    userId: actorId,
  });
  return role;
}

export async function updateRole(
  roleId: string,
  input: { name?: string; description?: string; permissions?: PermissionInput[] },
  actorId: string,
) {
  const existing = await prisma.role.findUniqueOrThrow({ where: { id: roleId } });
  if (existing.isSystem && input.name && input.name !== existing.name) {
    throw new Error("System roles cannot be renamed.");
  }
  if (input.name === SYSTEM_ADMIN_ROLE && existing.name !== SYSTEM_ADMIN_ROLE) {
    throw new Error("Reserved role name.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const role = await tx.role.update({
      where: { id: roleId },
      data: {
        name: input.name?.trim(),
        description: input.description?.trim(),
      },
    });
    if (input.permissions) {
      if (existing.isSystem) {
        throw new Error("Cannot change permissions on a system role.");
      }
      await tx.rolePermission.deleteMany({ where: { roleId } });
      await tx.rolePermission.createMany({
        data: input.permissions.map((p) => ({ ...p, roleId })),
      });
    }
    return role;
  });

  await logAudit({
    action: "UPDATE_ROLE",
    module: AppModule.SETTINGS,
    entityId: roleId,
    oldValues: { name: existing.name } as Prisma.InputJsonValue,
    newValues: input as unknown as Prisma.InputJsonValue,
    userId: actorId,
  });
  return updated;
}

export async function deleteRole(roleId: string, actorId: string) {
  const existing = await prisma.role.findUniqueOrThrow({
    where: { id: roleId },
    include: { _count: { select: { users: true } } },
  });
  if (existing.isSystem) throw new Error("System roles cannot be deleted.");
  if (existing._count.users > 0) throw new Error("Remove users from this role first.");

  await prisma.role.delete({ where: { id: roleId } });
  await logAudit({
    action: "DELETE_ROLE",
    module: AppModule.SETTINGS,
    entityId: roleId,
    oldValues: { name: existing.name } as Prisma.InputJsonValue,
    userId: actorId,
  });
}
