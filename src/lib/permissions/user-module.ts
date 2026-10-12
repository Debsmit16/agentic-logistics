import { AppModule } from "@prisma/client";
import { hasPermission, type PermissionAction } from "@/lib/rbac";

export type ModulePermissionFlags = {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export async function flagsForModule(
  roleName: string | undefined,
  module: AppModule,
): Promise<ModulePermissionFlags> {
  const actions: PermissionAction[] = ["canCreate", "canRead", "canUpdate", "canDelete"];
  const entries = await Promise.all(
    actions.map(async (action) => [action, await hasPermission(roleName, module, action)] as const),
  );
  return Object.fromEntries(entries) as ModulePermissionFlags;
}
