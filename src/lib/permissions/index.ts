import { SystemRole } from "@prisma/client";

export const ROLE_HOME: Record<SystemRole, string> = {
  OWNER: "/dashboard",
  ADMIN: "/dashboard",
  WAREHOUSE_MANAGER: "/warehouse",
  WAREHOUSE_STAFF: "/warehouse",
  DELIVERY_MANAGER: "/delivery",
  DELIVERY_BOY: "/delivery/my",
  ACCOUNTANT: "/finance",
};

const PERMISSIONS: Record<string, SystemRole[]> = {
  "users.manage": [SystemRole.OWNER, SystemRole.ADMIN],
  "warehouses.manage": [SystemRole.OWNER, SystemRole.ADMIN],
  "partners.manage": [SystemRole.OWNER, SystemRole.ADMIN],
  "parcels.read": [
    SystemRole.OWNER,
    SystemRole.ADMIN,
    SystemRole.WAREHOUSE_MANAGER,
    SystemRole.WAREHOUSE_STAFF,
    SystemRole.DELIVERY_MANAGER,
  ],
  "parcels.receive": [
    SystemRole.OWNER,
    SystemRole.ADMIN,
    SystemRole.WAREHOUSE_MANAGER,
    SystemRole.WAREHOUSE_STAFF,
  ],
  "parcels.store": [
    SystemRole.OWNER,
    SystemRole.ADMIN,
    SystemRole.WAREHOUSE_MANAGER,
    SystemRole.WAREHOUSE_STAFF,
  ],
  "delivery.manage": [
    SystemRole.OWNER,
    SystemRole.ADMIN,
    SystemRole.DELIVERY_MANAGER,
    SystemRole.WAREHOUSE_MANAGER,
  ],
  "delivery.execute": [SystemRole.DELIVERY_BOY],
  "cod.manage": [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.ACCOUNTANT],
  "reports.view": [
    SystemRole.OWNER,
    SystemRole.ADMIN,
    SystemRole.WAREHOUSE_MANAGER,
    SystemRole.DELIVERY_MANAGER,
    SystemRole.ACCOUNTANT,
  ],
  "fleet.view": [
    SystemRole.OWNER,
    SystemRole.ADMIN,
    SystemRole.WAREHOUSE_MANAGER,
    SystemRole.DELIVERY_MANAGER,
  ],
  "fleet.track": [SystemRole.DELIVERY_BOY, SystemRole.DELIVERY_MANAGER],
  "gst.manage": [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.ACCOUNTANT],
  "audit.view": [SystemRole.OWNER],
};

export function hasPermission(role: SystemRole, permission: string): boolean {
  if (role === SystemRole.OWNER) return true;
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function canAccessPath(role: SystemRole, pathname: string): boolean {
  if (pathname.startsWith("/track")) return true;
  if (pathname.startsWith("/login")) return true;
  if (role === SystemRole.DELIVERY_BOY) {
    return pathname.startsWith("/delivery/my") || pathname === "/delivery";
  }
  if (
    role === SystemRole.WAREHOUSE_STAFF ||
    role === SystemRole.WAREHOUSE_MANAGER
  ) {
    return (
      pathname.startsWith("/warehouse") ||
      pathname.startsWith("/parcels") ||
      pathname === "/dashboard"
    );
  }
  if (role === SystemRole.ACCOUNTANT) {
    return (
      pathname.startsWith("/finance") ||
      pathname.startsWith("/reports") ||
      pathname.startsWith("/settings/gst")
    );
  }
  if (role === SystemRole.DELIVERY_MANAGER) {
    return (
      pathname.startsWith("/delivery") ||
      pathname.startsWith("/fleet") ||
      pathname.startsWith("/parcels")
    );
  }
  return true;
}
