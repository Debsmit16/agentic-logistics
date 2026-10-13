import type { AppModule } from "@prisma/client";

export type NavItem = {
  module: AppModule;
  href: string;
  label: string;
};

/** Top-level operational modules (Settings is separate in the shell). */
export const MODULE_NAV: NavItem[] = [
  { module: "PARCELS", href: "/parcels", label: "Parcels" },
  { module: "WAREHOUSE", href: "/warehouse", label: "Warehouse" },
  { module: "DELIVERY", href: "/delivery", label: "Delivery" },
  { module: "FINANCE", href: "/finance", label: "Finance" },
];

export type SettingsNavItem = {
  href: string;
  label: string;
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  { href: "/settings/general", label: "General Settings" },
  { href: "/settings/users", label: "Users" },
  { href: "/settings/roles", label: "Roles" },
  { href: "/settings/logs", label: "System Logs" },
];
