import Link from "next/link";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { withAppLayout } from "@/lib/app-layout";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { IconBox, IconSettings, IconShield, IconUsers } from "@/components/icons/nav-icons";

export default async function DashboardPage() {
  await requireUser();

  const [
    totalOrders,
    activeOrders,
    deliveredOrders,
    userCount,
    roleCount,
    logCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["CONFIRMED", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } },
    }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.user.count(),
    prisma.role.count(),
    prisma.auditLog.count(),
  ]);

  return withAppLayout(
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <ErpPageHeader
        title="Dashboard"
        description="Real-time operational metrics, order execution, and platform administration."
      />

      {/* Real Live Operational Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Total Orders
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[var(--text)] tracking-tight">
            {totalOrders} <span className="text-xs font-normal text-[var(--muted)]">Consignments</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Active Dispatches
          </div>
          <div className="mt-1.5 text-2xl font-bold text-amber-500 tracking-tight">
            {activeOrders} <span className="text-xs font-normal text-[var(--muted)]">In Pipeline</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Completed Deliveries
          </div>
          <div className="mt-1.5 text-2xl font-bold text-emerald-500 tracking-tight">
            {deliveredOrders} <span className="text-xs font-normal text-[var(--muted)]">Delivered</span>
          </div>
        </div>
      </div>

      {/* Operational Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Operational Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/orders"
            className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)] hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] transition-transform group-hover:scale-105">
              <IconBox className="h-5 w-5 opacity-80" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  Orders Management
                </h3>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                  Live
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                Consignment lifecycle, AWB barcodes, volumetric weight calculation, and live tracking.
              </p>
            </div>
          </Link>

          <Link
            href="/settings/users"
            className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)] hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] transition-transform group-hover:scale-105">
              <IconSettings className="h-5 w-5 opacity-80" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  Settings & Governance
                </h3>
                <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[10px] font-semibold">
                  Admin
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                RBAC permissions, user access provisioning, and real-time security audit logging.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Telemetry & Quick Admin */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
          Platform Security & RBAC Status
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <IconUsers className="h-4 w-4 opacity-70" />
            <span><strong className="text-[var(--text)]">{userCount}</strong> accounts registered</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5">
            <IconShield className="h-4 w-4 opacity-70" />
            <span><strong className="text-[var(--text)]">{roleCount}</strong> RBAC roles active</span>
          </div>
          <span>&bull;</span>
          <span><strong className="text-[var(--text)]">{logCount}</strong> audit actions recorded</span>
        </div>
      </div>
    </div>
  );
}
