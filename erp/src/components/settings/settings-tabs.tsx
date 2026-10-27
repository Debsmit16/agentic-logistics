"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconActivity,
  IconRole,
  IconUsers,
} from "@/components/icons/nav-icons";

const TABS = [
  { href: "/settings/users", label: "Users & Accounts", icon: IconUsers },
  { href: "/settings/roles", label: "Roles & Permissions", icon: IconRole },
  { href: "/settings/logs", label: "Audit Logs & Telemetry", icon: IconActivity },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] pb-2">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-xs ring-1 ring-[var(--border)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-raised)]/60 hover:text-[var(--text)]"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 transition-colors ${
                isActive ? "text-[var(--primary)]" : "opacity-60 group-hover:opacity-100"
              }`}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
