import { unstable_cache } from "next/cache";
import type { AppModule } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PermissionAction = "canCreate" | "canRead" | "canUpdate" | "canDelete";

export const SYSTEM_ADMIN_ROLE = "System Admin";

export const getRolePermissions = unstable_cache(
  async (roleName: string, module: AppModule) => {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
      include: { permissions: { where: { module } } },
    });
    if (!role?.permissions.length) return null;
    return role.permissions[0];
  },
  ["role-permissions"],
  { tags: ["rbac"] },
);

export async function hasPermission(
  roleName: string | null | undefined,
  module: AppModule,
  action: PermissionAction,
): Promise<boolean> {
  if (!roleName) return false;
  if (roleName === SYSTEM_ADMIN_ROLE) return true;

  const permission = await getRolePermissions(roleName, module);
  if (!permission) return false;
  return permission[action] === true;
}

export function moduleLabel(module: AppModule): string {
  return module.replaceAll("_", " ");
}
