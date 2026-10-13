import Link from "next/link";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import {
  IconBox,
  IconWarehouse,
  IconTruck,
  IconWallet,
  IconDashboard,
} from "@/components/icons/nav-icons";

const MODULE_META: Record<
  string,
  {
    icon: typeof IconBox;
    description: string;
    highlights: string[];
  }
> = {
  Parcels: {
    icon: IconBox,
    description: "Inbound consignment registration, AWB barcodes, and lifecycle tracking.",
    highlights: ["Inbound AWB Intake", "Status State Machine", "Weighbridge Tare"],
  },
  Warehouse: {
    icon: IconWarehouse,
    description: "Cross-docking bays, physical shelf addressing, and weight capacity telemetry.",
    highlights: ["Shelf Location Matrix", "Inbound Weighing", "Stowage Routing"],
  },
  Delivery: {
    icon: IconTruck,
    description: "Last-mile batch dispatch, courier route sheets, and electronic proof-of-delivery.",
    highlights: ["Route Manifests", "Courier Allocation", "Digital e-POD"],
  },
  Finance: {
    icon: IconWallet,
    description: "Cash-on-delivery vault custody, bank settlements, and SAC 996812 GST invoicing.",
    highlights: ["COD Vault Ledger", "Bank Settlement", "B2B GST Invoices"],
  },
};

export function ModulePlaceholder({ name }: { name: string }) {
  const meta = MODULE_META[name] || {
    icon: IconBox,
    description: "Operational module staged for restoration.",
    highlights: ["Domain Models", "Services", "APIs"],
  };
  const IconComponent = meta.icon;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ErpPageHeader
        title={name}
        description={`${name} operational domain is staged for phase restoration.`}
      />

      {/* Minimalist, Elegant Coming Soon Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm sm:p-12 transition-all">
        {/* Clean Icon Circle */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--primary)] shadow-sm">
          <IconComponent className="h-6 w-6" />
        </div>

        {/* Status Badge */}
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Phase 3 &bull; Coming Soon</span>
        </div>

        {/* Title & Description */}
        <h2 className="mt-3 text-lg font-bold text-[var(--text)] tracking-tight sm:text-xl">
          {name} Module Architecture
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[var(--muted)]">
          {meta.description}
        </p>

        {/* Highlights Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {meta.highlights.map((h, i) => (
            <span
              key={i}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]/70 px-3 py-1 text-[11px] font-medium text-[var(--muted)]"
            >
              {h}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <Link
            href="/dashboard"
            className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            <IconDashboard className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
