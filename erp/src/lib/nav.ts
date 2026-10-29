import type { AppModule } from "@prisma/client";

export type NavItem = {
  module: AppModule;
  href: string;
  label: string;
};

/** Top-level operational modules (Settings is separate in the shell). */
export const MODULE_NAV: NavItem[] = [
  { module: "ORDERS", href: "/orders", label: "Orders" },
  { module: "DISPATCHES", href: "/dispatches", label: "Dispatches & Trips" },
  { module: "ORDERS", href: "/hub/scanner", label: "Hub Scanner Station" },
  { module: "ORDERS", href: "/tracking", label: "Consignment Tracker" },
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
