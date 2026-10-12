import type { AppModule } from "@prisma/client";

export type NavItem = {
  module: AppModule;
  href: string;
  label: string;
};

export const MODULE_NAV: NavItem[] = [
  { module: "USERS", href: "/users/roles", label: "Roles" },
  { module: "LOGS", href: "/logs", label: "Audit logs" },
  { module: "PROFILE", href: "/profile", label: "Profile" },
  { module: "PARCELS", href: "/parcels", label: "Parcels" },
  { module: "WAREHOUSE", href: "/warehouse", label: "Warehouse" },
  { module: "DELIVERY", href: "/delivery", label: "Delivery" },
  { module: "FINANCE", href: "/finance", label: "Finance" },
  { module: "SETTINGS", href: "/settings", label: "Settings" },
];
