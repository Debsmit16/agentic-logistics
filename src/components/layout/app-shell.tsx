"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/brand/app-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  IconBox,
  IconChevron,
  IconDashboard,
  IconSettings,
  IconTruck,
  IconWallet,
  IconWarehouse,
} from "@/components/icons/nav-icons";
import type { SettingsNavItem } from "@/lib/nav";

const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/parcels": IconBox,
  "/warehouse": IconWarehouse,
  "/delivery": IconTruck,
  "/finance": IconWallet,
};

function navItemClass(active: boolean) {
  return `nav-item ${active ? "nav-item-active" : ""}`;
}

function subItemClass(active: boolean) {
  return `nav-sub-item ${active ? "nav-sub-item-active" : ""}`;
}

export function AppShell({
  userName,
  userEmail,
  roleName,
  links,
  settingsLinks,
  children,
}: {
  userName: string;
  userEmail: string;
  roleName: string;
  links: { href: string; label: string }[];
  settingsLinks: SettingsNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"));

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const sidebarW = sidebarCollapsed ? "w-[4.25rem]" : "w-[var(--sidebar-width)]";

  return (
    <div className="flex min-h-screen">
      <aside
        className={`${sidebarW} flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200`}
      >
        <div className={`border-b border-[var(--border)] ${sidebarCollapsed ? "px-2 py-4" : "px-4 py-4"}`}>
          <Link href="/dashboard" className="block">
            <AppLogo compact={sidebarCollapsed} />
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          <Link
            href="/dashboard"
            className={navItemClass(pathname === "/dashboard")}
            title="Dashboard"
          >
            <IconDashboard className="shrink-0 opacity-80" />
            {!sidebarCollapsed ? <span>Dashboard</span> : null}
          </Link>

          {links.map((l) => {
            const Icon = MODULE_ICONS[l.href] ?? IconBox;
            return (
              <Link key={l.href} href={l.href} className={navItemClass(isActive(l.href))} title={l.label}>
                <Icon className="shrink-0 opacity-80" />
                {!sidebarCollapsed ? <span>{l.label}</span> : null}
              </Link>
            );
          })}

          {settingsLinks.length > 0 && !sidebarCollapsed ? (
            <div className="pt-1">
              <button
                type="button"
                className={`${navItemClass(pathname.startsWith("/settings"))} justify-between`}
                onClick={() => setSettingsOpen((o) => !o)}
              >
                <span className="flex items-center gap-2.5">
                  <IconSettings className="shrink-0 opacity-80" />
                  Settings
                </span>
                <IconChevron open={settingsOpen} />
              </button>
              {settingsOpen ? (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-[var(--border)] pl-2">
                  {settingsLinks.map((s) => (
                    <Link key={s.href} href={s.href} className={subItemClass(isActive(s.href))}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {settingsLinks.length > 0 && sidebarCollapsed ? (
            <Link
              href="/settings/users"
              className={navItemClass(pathname.startsWith("/settings"))}
              title="Settings"
            >
              <IconSettings className="shrink-0 opacity-80" />
            </Link>
          ) : null}
        </nav>

        <div className={`border-t border-[var(--border)] ${sidebarCollapsed ? "p-2" : "p-3"}`}>
          {sidebarCollapsed ? (
            <Link href="/profile" title={userName}>
              <UserAvatar name={userName} size="sm" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-2.5">
              <UserAvatar name={userName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{userName}</p>
                <p className="truncate text-xs text-[var(--muted)]">{userEmail}</p>
              </div>
            </div>
          )}
          {!sidebarCollapsed ? (
            <div className="mt-2 flex gap-3 px-1 text-xs">
              <Link href="/profile" className="text-[var(--primary)] hover:underline">Profile</Link>
              <button
                type="button"
                className="text-[var(--muted)] hover:text-[var(--text)] hover:underline"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
          {!sidebarCollapsed ? (
            <p className="mt-2 truncate px-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">{roleName}</p>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3.5">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:bg-neutral-50 hover:text-[var(--text)]"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((c) => !c)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
            </svg>
          </button>
          <Breadcrumbs />
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
