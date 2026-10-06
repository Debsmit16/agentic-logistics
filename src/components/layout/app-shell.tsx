import Link from "next/link";
import type { SystemRole } from "@prisma/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LogoutButton } from "@/components/layout/logout-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const NAV: Partial<Record<SystemRole, { href: string; label: string }[]>> = {
  OWNER: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/parcels", label: "Parcels" },
    { href: "/warehouse", label: "Warehouse" },
    { href: "/delivery", label: "Delivery" },
    { href: "/finance", label: "COD" },
    { href: "/settings/partners", label: "Partners" },
    { href: "/settings/customers", label: "Customers" },
    { href: "/settings/warehouses", label: "Warehouses" },
    { href: "/settings/employees", label: "Employees" },
    { href: "/reports", label: "Reports" },
    { href: "/notifications", label: "Alerts" },
    { href: "/exceptions", label: "Exceptions" },
    { href: "/settings/system", label: "System" },
    { href: "/settings/audit", label: "Audit" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/parcels", label: "Parcels" },
    { href: "/warehouse", label: "Warehouse" },
    { href: "/delivery", label: "Delivery" },
    { href: "/settings/partners", label: "Partners" },
    { href: "/settings/customers", label: "Customers" },
    { href: "/settings/warehouses", label: "Warehouses" },
    { href: "/settings/employees", label: "Employees" },
    { href: "/reports", label: "Reports" },
  ],
  WAREHOUSE_MANAGER: [
    { href: "/warehouse", label: "Warehouse" },
    { href: "/parcels", label: "Parcels" },
    { href: "/delivery", label: "Delivery" },
  ],
  WAREHOUSE_STAFF: [
    { href: "/warehouse", label: "Warehouse" },
    { href: "/parcels", label: "Find" },
  ],
  DELIVERY_MANAGER: [
    { href: "/delivery", label: "Delivery" },
    { href: "/delivery/failed", label: "Failed" },
    { href: "/parcels", label: "Parcels" },
  ],
  DELIVERY_BOY: [{ href: "/delivery/my", label: "My Deliveries" }],
  ACCOUNTANT: [
    { href: "/finance", label: "COD" },
    { href: "/reports", label: "Reports" },
  ],
};

export function AppShell({
  userName,
  role,
  preferredLang = "en",
  children,
}: {
  userName: string;
  role: SystemRole;
  preferredLang?: string;
  children: React.ReactNode;
}) {
  const links = NAV[role] ?? NAV.OWNER!;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <BrandLogo href="/dashboard" size="sm" />
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 hover:bg-teal-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <LanguageSwitcher current={preferredLang} />
            <span>
              {userName} · {role.replaceAll("_", " ")}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
