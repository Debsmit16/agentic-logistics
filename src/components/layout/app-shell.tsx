"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SystemRole } from "@prisma/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LogoutButton } from "@/components/layout/logout-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PlatformGuide } from "@/components/guide/platform-guide";
import { isSuperadminRole } from "@/lib/guide/demo-test-accounts";
import { useT } from "@/components/i18n/i18n-provider";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  Truck,
  Navigation,
  MapPin,
  IndianRupee,
  BarChart3,
  Settings,
  AlertTriangle,
  Bell,
  CircleDot,
  User as UserIcon,
} from "lucide-react";

function getNavIcon(href: string) {
  if (href.includes("dashboard")) return LayoutDashboard;
  if (href.includes("warehouse")) return Warehouse;
  if (href.includes("parcels")) return Package;
  if (href.includes("delivery/my")) return Navigation;
  if (href.includes("delivery")) return Truck;
  if (href.includes("fleet")) return MapPin;
  if (href.includes("finance")) return IndianRupee;
  if (href.includes("reports")) return BarChart3;
  if (href.includes("exceptions")) return AlertTriangle;
  if (href.includes("notifications")) return Bell;
  if (href.includes("settings")) return Settings;
  return CircleDot;
}

export function AppShell({
  userName,
  role,
  preferredLang = "en",
  links,
  children,
}: {
  userName: string;
  role: SystemRole;
  preferredLang?: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  const showGuideOnLoad = isSuperadminRole(role) && pathname === "/dashboard";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const roleLabel = role.replaceAll("_", " ");
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="erp-shell min-h-screen flex text-[var(--text-primary)] bg-[var(--bg-base)] transition-colors duration-200 antialiased">
      {/* Skeuomorphic Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col z-20 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
        {/* Brand header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <BrandLogo href={links[0]?.href ?? "/dashboard"} size="sm" showWordmark={true} />
        </div>

        <div className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Control Plane
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto" aria-label="Main">
          {links.map((l) => {
            const Icon = getNavIcon(l.href);
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`skeuo-nav-link ${
                  active
                    ? "skeuo-nav-link-active"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-[var(--accent-primary)] drop-shadow-[0_0_6px_var(--accent-glow)]" : "text-[var(--text-muted)]"
                  }`}
                />
                <span className="truncate">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card with Inset Bevel */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] m-3 rounded-2xl border shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md ring-1 ring-white/20">
              {initials || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{userName}</p>
              <p className="text-[11px] font-semibold text-[var(--accent-primary)] capitalize truncate">
                {roleLabel.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar with Tactile Controls */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-[var(--bg-surface)] backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <BrandLogo href={links[0]?.href ?? "/dashboard"} size="sm" />
            </span>
            <div className="hidden lg:flex items-center gap-2.5 text-xs text-[var(--text-muted)] font-medium">
              <span className="px-3 py-1 rounded-full bg-[var(--bg-surface-muted)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-2xs">
                {t("appName")}
              </span>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-bold capitalize">{roleLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Skeuomorphic Dark/Light Switch */}
            <ThemeToggle />
            <div className="h-4 w-px bg-[var(--border-subtle)]" />
            <LanguageSwitcher current={preferredLang} />
            <div className="h-4 w-px bg-[var(--border-subtle)]" />
            <LogoutButton />
          </div>
        </header>

        {/* Mobile Horizontal Navigation Strip */}
        <nav
          className="lg:hidden flex gap-1.5 overflow-x-auto p-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] scrollbar-none"
          aria-label="Main mobile"
        >
          {links.map((l) => {
            const Icon = getNavIcon(l.href);
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>

      <PlatformGuide role={role} defaultOpen={showGuideOnLoad} />
    </div>
  );
}
