import Link from "next/link";
import { AppModule } from "@prisma/client";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import {
  IconBox,
  IconWarehouse,
  IconTruck,
  IconWallet,
} from "@/components/icons/nav-icons";

const DOMAINS = [
  {
    name: "Parcels",
    href: "/parcels",
    icon: IconBox,
    desc: "Consignment lifecycle, AWB barcodes & tracking manifests.",
  },
  {
    name: "Warehouse",
    href: "/warehouse",
    icon: IconWarehouse,
    desc: "Cross-dock bay, shelf location matrix & weighbridge scaling.",
  },
  {
    name: "Delivery",
    href: "/delivery",
    icon: IconTruck,
    desc: "Last-mile batch dispatch, route sheets & digital e-POD.",
  },
  {
    name: "Finance",
    href: "/finance",
    icon: IconWallet,
    desc: "COD vault custody, bank remittances & GST freight invoicing.",
  },
];

export default async function DashboardPage() {
  await requirePermission(AppModule.PROFILE, "canRead");

  const [userCount, roleCount, logCount] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.auditLog.count(),
  ]);

  return withAppLayout(
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <ErpPageHeader
        title="Dashboard"
        description="Overview of system access, security governance, and operational modules."
      />

      {/* Clean Telemetry Cards (3 items, spacious) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Users
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[var(--text)] tracking-tight">
            {userCount} <span className="text-xs font-normal text-[var(--muted)]">Active Accounts</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Roles & Access
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[var(--text)] tracking-tight">
            {roleCount} <span className="text-xs font-normal text-[var(--muted)]">Roles Configured</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Audit Trail
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[var(--text)] tracking-tight">
            {logCount} <span className="text-xs font-normal text-[var(--muted)]">Logged Events</span>
          </div>
        </div>
      </div>

      {/* Core Operational Domains (Sleek 2x2 grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Logistics Core Modules
          </h2>
          <span className="text-[11px] text-[var(--muted)]">Phase 3 Staging</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOMAINS.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.name}
                href={mod.href}
                className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5 opacity-80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {mod.name}
                    </h3>
                    <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                      Coming Soon
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Administrative Shortcuts */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
          Quick Administration
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings/users"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 px-3.5 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-raised)]"
          >
            Users Directory &rarr;
          </Link>
          <Link
            href="/settings/roles"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 px-3.5 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-raised)]"
          >
            RBAC Permissions &rarr;
          </Link>
          <Link
            href="/settings/logs"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 px-3.5 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-raised)]"
          >
            Security Audit Logs &rarr;
          </Link>
          <Link
            href="/settings/general"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 px-3.5 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-raised)]"
          >
            System Settings &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
