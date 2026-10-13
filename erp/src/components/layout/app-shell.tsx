"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/brand/app-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  IconBox,
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const sidebarW = sidebarCollapsed ? "w-[4.5rem]" : "w-[var(--sidebar-width)]";

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <aside
        className={`${sidebarW} flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 select-none`}
      >
        {/* Brand Header */}
        <div className={`flex items-center justify-between border-b border-[var(--border)] ${sidebarCollapsed ? "px-3 py-4" : "px-5 py-4"}`}>
          <Link href="/dashboard" className="block focus:outline-none">
            <AppLogo compact={sidebarCollapsed} />
          </Link>
        </div>

        {/* Navigation Body */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {/* Main Group */}
          <div>
            {!sidebarCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Overview
              </div>
            )}
            <Link
              href="/dashboard"
              className={navItemClass(pathname === "/dashboard")}
              title="Dashboard"
            >
              <IconDashboard className="h-4 w-4 shrink-0 opacity-75" />
              {!sidebarCollapsed && <span className="truncate">Dashboard</span>}
            </Link>
          </div>

          {/* Operational Domains Group */}
          {links.length > 0 && (
            <div>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Logistics Core
                </div>
              )}
              <div className="space-y-0.5">
                {links.map((l) => {
                  const Icon = MODULE_ICONS[l.href] ?? IconBox;
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={navItemClass(active)}
                      title={l.label}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-75" />
                      {!sidebarCollapsed && (
                        <div className="flex flex-1 items-center justify-between">
                          <span className="truncate">{l.label}</span>
                          <span className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--muted)]">
                            Soon
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings & Admin Group */}
          {settingsLinks.length > 0 && (
            <div>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Administration
                </div>
              )}
              <Link
                href="/settings/users"
                className={navItemClass(pathname.startsWith("/settings"))}
                title="Settings & RBAC"
              >
                <IconSettings className="h-4 w-4 shrink-0 opacity-75" />
                {!sidebarCollapsed && <span className="truncate">Settings & RBAC</span>}
              </Link>
            </div>
          )}
        </nav>

        {/* User Footer Card */}
        <div className={`border-t border-[var(--border)] ${sidebarCollapsed ? "p-3 text-center" : "p-3.5"}`}>
          {sidebarCollapsed ? (
            <Link href="/profile" title={userName} className="inline-block">
              <UserAvatar name={userName} size="sm" />
            </Link>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <UserAvatar name={userName} size="sm" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[var(--text)]">{userName}</p>
                  <p className="truncate text-[11px] text-[var(--muted)]">{roleName}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border)] pt-2 text-[11px]">
                <Link
                  href="/profile"
                  className="font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
                >
                  Account
                </Link>
                <button
                  type="button"
                  className="font-medium text-rose-600 transition hover:text-rose-700 dark:text-rose-400"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/login");
                    router.refresh();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Floating Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((c) => !c)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M9 4v16" />
              </svg>
            </button>
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-3">
            {/* Operational Health Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>

            {/* Aesthetic Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
