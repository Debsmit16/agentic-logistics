"use client";

import Link from "next/link";
import type { SystemRole } from "@prisma/client";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SuperadminPlaybook } from "@/components/guide/superadmin-playbook";
import { isSuperadminRole } from "@/lib/guide/demo-test-accounts";
import {
  Warehouse,
  Package,
  Truck,
  MapPin,
  IndianRupee,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Receipt,
  type LucideIcon,
} from "lucide-react";

interface QuickAction {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

export function DashboardView({
  role,
  stats,
}: {
  role: SystemRole;
  stats: {
    total: number;
    received: number;
    outForDelivery: number;
    deliveredToday: number;
    failedOpen: number;
    aging: number;
  };
}) {
  const t = useT();
  const superadmin = isSuperadminRole(role);

  const quickLinks: QuickAction[] = [];
  if (role === "OWNER" || role === "ADMIN") {
    quickLinks.push(
      {
        href: "/warehouse",
        label: t("warehouse"),
        desc: "Scan intake, weigh & assign physical shelves",
        icon: Warehouse,
        color: "from-blue-600 to-cyan-600",
      },
      {
        href: "/parcels",
        label: t("navParcels"),
        desc: "Master shipment tracking & lifecycle registry",
        icon: Package,
        color: "from-indigo-600 to-violet-600",
      },
      {
        href: "/delivery",
        label: t("delivery"),
        desc: "Dispatch batches & assign riders",
        icon: Truck,
        color: "from-amber-600 to-orange-600",
      },
      {
        href: "/fleet",
        label: t("navFleet"),
        desc: "Live GPS breadcrumbs & delivery route map",
        icon: MapPin,
        color: "from-emerald-600 to-teal-600",
      },
      {
        href: "/finance",
        label: t("navCod"),
        desc: "Cash on delivery ledger & settlements",
        icon: IndianRupee,
        color: "from-purple-600 to-pink-600",
      },
      {
        href: "/reports",
        label: t("navReports"),
        desc: "Aging analytics & operational audit reports",
        icon: BarChart3,
        color: "from-slate-700 to-slate-900",
      },
    );
  } else if (role === "WAREHOUSE_MANAGER" || role === "WAREHOUSE_STAFF") {
    quickLinks.push(
      {
        href: "/warehouse",
        label: t("warehouse"),
        desc: "Intake scanning & shelf sorting",
        icon: Warehouse,
        color: "from-blue-600 to-cyan-600",
      },
      {
        href: "/parcels",
        label: t("navParcels"),
        desc: "Search parcel records & print shipping labels",
        icon: Package,
        color: "from-indigo-600 to-violet-600",
      },
    );
  } else if (role === "DELIVERY_MANAGER") {
    quickLinks.push(
      {
        href: "/delivery",
        label: t("delivery"),
        desc: "Create batches & assign riders",
        icon: Truck,
        color: "from-amber-600 to-orange-600",
      },
      {
        href: "/fleet",
        label: t("navFleet"),
        desc: "Real-time rider GPS tracking",
        icon: MapPin,
        color: "from-emerald-600 to-teal-600",
      },
      {
        href: "/delivery/failed",
        label: t("failedDeliveries"),
        desc: "Reattempt scheduling & returns",
        icon: AlertTriangle,
        color: "from-rose-600 to-red-600",
      },
    );
  } else if (role === "ACCOUNTANT") {
    quickLinks.push(
      {
        href: "/finance",
        label: t("navCod"),
        desc: "COD collection settlement & ledger",
        icon: IndianRupee,
        color: "from-purple-600 to-pink-600",
      },
      {
        href: "/finance/invoices",
        label: t("navInvoices"),
        desc: "GST tax invoices & HSN/SAC reports",
        icon: Receipt,
        color: "from-cyan-600 to-blue-600",
      },
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title={t("dashboard")}
        description={superadmin ? t("dashboardSubtitleOwner") : t("dashboardSubtitle")}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t("totalParcels")} value={stats.total} icon={Package} />
        <StatCard label={t("receivedNow")} value={stats.received} tone="info" icon={Warehouse} />
        <StatCard
          label={t("outForDelivery")}
          value={stats.outForDelivery}
          tone="warning"
          icon={Truck}
        />
        <StatCard
          label={t("deliveredToday")}
          value={stats.deliveredToday}
          tone="success"
          trend="Live today"
        />
        <StatCard
          label={t("failedReattempt")}
          value={stats.failedOpen}
          tone="danger"
          icon={AlertTriangle}
        />
        <StatCard
          label={t("agingOpen")}
          value={stats.aging}
          tone={stats.aging > 0 ? "warning" : "default"}
          hint="Parcels > 7 days in system"
        />
      </div>

      {/* Quick Operational Actions */}
      {quickLinks.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <span>{t("quickActions")}</span>
              <span className="text-xs font-normal text-[var(--text-muted)]">Â· Fast access</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="skeuo-card group relative flex flex-col justify-between p-5 hover:-translate-y-1 overflow-hidden transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md group-hover:scale-105 transition-transform duration-200 ring-1 ring-white/20`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="p-1.5 rounded-full text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {action.label}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-1">{action.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {superadmin ? <SuperadminPlaybook /> : null}
    </div>
  );
}

