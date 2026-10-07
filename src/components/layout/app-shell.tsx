"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SystemRole } from "@prisma/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LogoutButton } from "@/components/layout/logout-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
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
    <div className="erp-shell bg-slate-50 min-h-screen flex text-slate-800 antialiased">
      {/* Sidebar */}
      <aside className="erp-sidebar w-64 shrink-0 bg-slate-950 text-slate-200 border-r border-slate-800/80 hidden lg:flex flex-col z-20">
        <div className="erp-sidebar-brand p-5 border-b border-slate-800/80 flex items-center justify-between">
          <BrandLogo href={links[0]?.href ?? "/dashboard"} size="sm" showWordmark={true} />
        </div>

        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        <nav className="erp-sidebar-nav flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Main">
          {links.map((l) => {
            const Icon = getNavIcon(l.href);
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-cyan-500/15 text-cyan-400 font-semibold shadow-xs border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-cyan-400" : "text-slate-500"
                  }`}
                />
                <span className="truncate">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="erp-sidebar-foot p-4 border-t border-slate-800/80 bg-slate-950/60 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-white/10">
              {initials || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-[11px] font-medium text-cyan-400 capitalize truncate">
                {roleLabel.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="erp-main-wrap flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="erp-topbar sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
          <div className="erp-topbar-start flex items-center gap-3">
            <span className="lg:hidden">
              <BrandLogo href={links[0]?.href ?? "/dashboard"} size="sm" />
            </span>
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
                {t("appName")}
              </span>
              <span>/</span>
              <span className="text-slate-800 font-semibold capitalize">{roleLabel}</span>
            </div>
          </div>

          <div className="erp-topbar-end flex items-center gap-2.5">
            <LanguageSwitcher current={preferredLang} />
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <LogoutButton />
          </div>
        </header>

        {/* Mobile Nav Strip */}
        <nav
          className="erp-mobile-nav lg:hidden flex gap-1.5 overflow-x-auto p-2 bg-slate-950 border-b border-slate-800 scrollbar-none"
          aria-label="Main mobile"
        >
          {links.map((l) => {
            const Icon = getNavIcon(l.href);
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-colors ${
                  active
                    ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        <main className="erp-main flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>

      <PlatformGuide role={role} defaultOpen={showGuideOnLoad} />
    </div>
  );
}
