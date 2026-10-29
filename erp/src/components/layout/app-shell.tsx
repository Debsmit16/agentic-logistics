"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/brand/app-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import { LOGO } from "@/lib/brand";
import {
  IconActivity,
  IconBox,
  IconDashboard,
  IconSearch,
  IconBarcode,
  IconSettings,
  IconTruck,
  IconWallet,
  IconWarehouse,
} from "@/components/icons/nav-icons";
import type { SettingsNavItem } from "@/lib/nav";

const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/orders": IconBox,
  "/dispatches": IconTruck,
  "/hub/scanner": IconBarcode,
  "/tracking": IconSearch,
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDesktopEnv =
        Boolean((window as unknown as { desktopClient?: { isDesktop?: boolean } }).desktopClient?.isDesktop) ||
        Boolean((window as unknown as { isAgenticDesktop?: boolean }).isAgenticDesktop) ||
        navigator.userAgent.includes("AgenticDesktop") ||
        document.documentElement.classList.contains("agentic-desktop-app");

      if (isDesktopEnv) {
        setIsDesktop(true);
      }
    }
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const sidebarW = sidebarCollapsed ? "w-[4.5rem]" : "w-[var(--sidebar-width)]";

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-[var(--bg)]">
      {/* Sidebar - Fixed to screen, non-scrollable */}
      <aside
        className={`${sidebarW} flex h-full shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 select-none z-30`}
      >
        {/* Brand Header */}
        <div className={`flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] ${sidebarCollapsed ? "px-3" : "px-5"}`}>
          <Link href="/dashboard" className="block focus:outline-none">
            <AppLogo compact={sidebarCollapsed} />
          </Link>
        </div>

        {/* Navigation Body */}
        <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      {!sidebarCollapsed && <span className="truncate flex-1">{l.label}</span>}
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
        <div className={`shrink-0 border-t border-[var(--border)] ${sidebarCollapsed ? "p-3 text-center" : "p-3.5"}`}>
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
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Floating Topbar */}
        <header className="shrink-0 z-20 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-6 backdrop-blur-md">
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

          <div className="flex items-center gap-2.5">
            {/* Theme Mode Switcher */}
            <ThemeToggle />

            {/* Desktop App Download Button (hidden when already running inside the desktop app) */}
            {!isDesktop && (
              <a
                href="/api/download"
                download="Agentic-Logistics-Setup.exe"
                title="Download Agentic Logistics for Windows"
                className="agentic-download-btn group inline-flex h-8 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/80 px-2.5 sm:px-3 text-xs font-semibold text-[var(--text)] shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-[var(--surface-raised)] hover:shadow-md active:scale-95"
              >
                <Image
                  src={LOGO.sm}
                  alt="Agentic Logistics"
                  width={18}
                  height={18}
                  className="shrink-0 object-contain transition-transform group-hover:scale-110"
                />
                <span className="hidden sm:inline">Download</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500 transition-transform group-hover:translate-y-0.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 lg:p-10">{children}</main>

        {/* Sleek Enterprise Footer */}
        <footer className="shrink-0 z-10 flex h-9 items-center justify-between border-t border-[var(--border)] bg-[var(--surface)]/90 px-6 text-[11px] text-[var(--muted)] backdrop-blur-md select-none">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Agentic Logistics Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">System Operational</span>
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 font-semibold text-[var(--text)]">v1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
