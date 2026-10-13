import { cache } from "react";
import { redirect } from "next/navigation";
import type { AppModule } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission, SYSTEM_ADMIN_ROLE, type PermissionAction } from "@/lib/rbac";

export const getAuthenticatedUser = cache(async () => getSessionUser());

export async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(module: AppModule, action: PermissionAction) {
  const user = await requireUser();
  const roleName = user.role?.name;
  const ok = await hasPermission(roleName, module, action);
  if (!ok) redirect("/unauthorized");
  return user;
}

export async function requireApiPermission(module: AppModule, action: PermissionAction) {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiAuthError("Unauthorized", 401);
  }
  const ok = await hasPermission(user.role?.name, module, action);
  if (!ok) {
    throw new ApiAuthError("Forbidden", 403);
  }
  return user;
}

export class ApiAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function navModulesForUser(user: Awaited<ReturnType<typeof getSessionUser>>) {
  if (!user?.role) return [];
  const roleName = user.role.name;
  if (roleName === SYSTEM_ADMIN_ROLE) {
    return user.role.permissions.length
      ? [...new Set(user.role.permissions.map((p) => p.module))]
      : [];
  }
  return user.role.permissions.filter((p) => p.canRead).map((p) => p.module);
}
