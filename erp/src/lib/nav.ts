import type { AppModule } from "@prisma/client";

export type NavItem = {
  module: AppModule;
  href: string;
  label: string;
};

/** Top-level operational modules (Settings is separate in the shell). */
export const MODULE_NAV: NavItem[] = [
  { module: "ORDERS", href: "/orders", label: "Orders" },
];

export type SettingsNavItem = {
  href: string;
  label: string;
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  { href: "/settings/users", label: "Users" },
  { href: "/settings/roles", label: "Roles" },
  { href: "/settings/logs", label: "System Logs" },
];
