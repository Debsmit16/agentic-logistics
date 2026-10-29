"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { SvgBarcode } from "@/components/orders/svg-barcode";
import {
  IconSearch,
  IconBox,
  IconTruck,
  IconCheck,
  IconPrinter,
  IconTag,
} from "@/components/icons/nav-icons";
import { OrderLetterheadModal } from "@/components/orders/order-letterhead-modal";
import { OrderPrintModal } from "@/components/orders/order-print-modal";
import type { OrderDetail } from "@/components/orders/order-detail-modal";

interface TrackingData {
  id: string;
  orderNumber: string;
  awbNumber: string;
  status: string;
  statusLabel: string;
  paymentMode: string;
  serviceType: string;
  totalAmount: number;
  packageWeight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumetricWeight: number;
  chargeableWeight: number;
  itemDescription: string;
  deliveryNotes?: string | null;
  ndrReason?: string | null;
  createdAt: string;

  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;

  stageIndex: number;
  isDelivered: boolean;
  hasNdr: boolean;

  dispatchTrip?: {
    id: string;
    tripNumber: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    originHub: string;
    destinationHub?: string | null;
    status: string;
  } | null;

  milestones: Array<{
    id: string;
    status: string;
    title: string;
    description?: string | null;
    location?: string | null;
    performedBy?: string | null;
    createdAt: string;
  }>;

  proofAttachments: Array<{
    id: string;
    type: string;
    fileName: string;
    caption?: string | null;
    url: string;
  }>;
}

const STAGES = [
  { label: "Booked", desc: "Registered & Label Created" },
  { label: "Hub Inbound", desc: "Staged / Linehaul Transfer" },
  { label: "Out for Delivery", desc: "With Courier Rider" },
  { label: "Delivered", desc: "Verified with e-POD" },
];

export function TrackingClient() {
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || searchParams.get("q") || "";

  const [query, setQuery] = useState(initialAwb);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals for Printing
  const [printLabelOpen, setPrintLabelOpen] = useState(false);
  const [printLetterheadOpen, setPrintLetterheadOpen] = useState(false);

  const fetchTracking = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tracking?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "No shipment found matching reference.");
      }
      setData(json.tracking);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load tracking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialAwb) {
      fetchTracking(initialAwb);
    }
  }, [initialAwb, fetchTracking]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(query);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ErpPageHeader
        title="Live Consignment Tracker"
        description="Unified tracking command center for real-time shipment telemetry, milestone audit history, and digital e-POD verification."
      />

      {/* Search Bar Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-[var(--muted)]">
              <IconSearch className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              placeholder="Search by AWB (e.g. AWB-699902477) or Order Ref (e.g. ORD-527314-533)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-10 h-10 w-full font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-5 text-xs font-semibold"
          >
            {loading ? "Locating..." : "Track Shipment"}
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[var(--muted)]">
          <span className="font-semibold">Quick Lookup Samples:</span>
          <button
            type="button"
            onClick={() => {
              setQuery("AWB-699902477");
              fetchTracking("AWB-699902477");
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 font-mono text-sky-400 hover:border-sky-500/40"
          >
            AWB-699902477 (Amit Patel · Delivered)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("AWB-815606218");
              fetchTracking("AWB-815606218");
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 font-mono text-amber-400 hover:border-amber-500/40"
          >
            AWB-815606218 (Priya Sharma · NDR Rescheduled)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Status & Journey Stepper Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-6">
            {/* Header: AWB, Barcode & Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-lg font-black tracking-tight text-[var(--text)]">
                    {data.awbNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                      data.status === "DELIVERED"
                        ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                        : data.hasNdr
                        ? "border border-rose-500/30 bg-rose-500/15 text-rose-400"
                        : "border border-sky-500/30 bg-sky-500/15 text-sky-400"
                    }`}
                  >
                    {data.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="font-mono text-xs text-[var(--muted)] mt-1">
                  Order Ref: <strong className="text-[var(--text)]">{data.orderNumber}</strong> · Booked on{" "}
                  {new Date(data.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-2">
                  <SvgBarcode value={data.awbNumber} height={20} className="w-32" />
                </div>
              </div>

              {/* Action Buttons: Print Shipping Label & Official Letterhead */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintLabelOpen(true)}
                  className="btn btn-ghost text-xs"
                >
                  <IconTag className="h-3.5 w-3.5" />
                  <span>Thermal Label</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLetterheadOpen(true)}
                  className="btn btn-primary text-xs"
                >
                  <IconPrinter className="h-3.5 w-3.5" />
                  <span>Print Manifest Note</span>
                </button>
              </div>
            </div>

            {/* Current Status Headline */}
            <div
              className={`rounded-2xl p-4 border ${
                data.status === "DELIVERED"
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : data.hasNdr
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                  : "border-sky-500/25 bg-sky-500/10 text-sky-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Live Dispatch Status
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold">{data.statusLabel}</p>
            </div>

            {/* 4-Step Journey Stepper */}
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STAGES.map((stg, idx) => {
                  const isCompleted = idx <= data.stageIndex;
                  const isCurrent = idx === data.stageIndex;
                  return (
                    <div
                      key={stg.label}
                      className={`relative flex flex-col p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? "border-sky-500/40 bg-sky-500/10 shadow-sm"
                          : isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/5 text-[var(--text)]"
                          : "border-[var(--border)] bg-[var(--surface-raised)]/30 opacity-60 text-[var(--muted)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold">0{idx + 1}</span>
                        {isCompleted && !isCurrent ? (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-black">
                            <IconCheck className="h-2.5 w-2.5" />
                          </span>
                        ) : isCurrent ? (
                          <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                        ) : null}
                      </div>
                      <h4 className="mt-2 text-xs font-bold">{stg.label}</h4>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">{stg.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3-Column Operational Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Shipper & Consignee Bilateral Info */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                <IconBox className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Consignment Route
                </h3>
              </div>

              {/* Origin */}
              <div>
                <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Origin Facility</span>
                <p className="text-xs font-semibold text-[var(--text)]">{data.senderName}</p>
                <p className="text-[11px] text-[var(--muted)]">{data.senderAddress}, {data.senderCity} - {data.senderPincode}</p>
                <p className="font-mono text-[10px] text-sky-400 mt-0.5">{data.senderPhone}</p>
              </div>

              {/* Destination */}
              <div className="pt-2 border-t border-[var(--border)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Consignee Destination</span>
                <p className="text-xs font-semibold text-[var(--text)]">{data.receiverName}</p>
                <p className="text-[11px] text-[var(--muted)]">{data.receiverAddress}, {data.receiverCity} - {data.receiverPincode}</p>
                <p className="font-mono text-[10px] text-sky-400 mt-0.5">{data.receiverPhone}</p>
              </div>

              {/* Package Specs */}
              <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-[var(--muted)]">Service:</span>
                  <p className="font-semibold text-[var(--text)]">{data.serviceType}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)]">Payment:</span>
                  <p className="font-semibold text-amber-400">
                    {data.paymentMode === "COD" ? `COD ₹${data.totalAmount}` : "PREPAID"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)]">Weight:</span>
                  <p className="font-semibold text-[var(--text)]">{data.packageWeight} kg</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)]">Contents:</span>
                  <p className="font-semibold text-[var(--text)] truncate">{data.itemDescription}</p>
                </div>
              </div>
            </div>

            {/* Column 2: Active Dispatch & Rider Telemetry */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                <IconTruck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Courier Fleet Telemetry
                </h3>
              </div>

              {data.dispatchTrip ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Assigned Rider</span>
                    <p className="text-sm font-black text-[var(--text)]">{data.dispatchTrip.driverName}</p>
                    <a
                      href={`tel:${data.dispatchTrip.driverPhone}`}
                      className="inline-flex items-center gap-1 font-mono text-xs text-sky-400 hover:underline"
                    >
                      📞 {data.dispatchTrip.driverPhone}
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--muted)]">Vehicle Reg</span>
                      <p className="font-mono font-bold text-[var(--text)]">{data.dispatchTrip.vehicleNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)]">Dispatch Trip</span>
                      <p className="font-mono text-xs font-bold text-sky-400">{data.dispatchTrip.tripNumber}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-2.5 text-xs">
                    <span className="text-[10px] text-[var(--muted)]">Origin Sorting Depot</span>
                    <p className="font-semibold text-[var(--text)]">{data.dispatchTrip.originHub}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[var(--muted)] space-y-1">
                  <p>Consignment is currently in hub staging.</p>
                  <p className="text-[11px]">Rider telemetry will stream once attached to an active dispatch run-sheet.</p>
                </div>
              )}

              {/* NDR Exception Box if active */}
              {data.hasNdr && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs space-y-1">
                  <span className="font-bold text-rose-400 uppercase text-[10px]">Active NDR Exception</span>
                  <p className="font-semibold text-rose-300">{data.ndrReason}</p>
                </div>
              )}
            </div>

            {/* Column 3: Proof of Delivery (e-POD) & Attachments */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                <IconCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Proof of Delivery (e-POD)
                </h3>
              </div>

              {data.isDelivered ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Delivery Status</span>
                    <p className="text-xs font-bold text-emerald-300 mt-0.5">
                      Verified with Digital Signature
                    </p>
                    {data.paymentMode === "COD" && (
                      <p className="font-mono text-xs font-semibold text-emerald-400 mt-1">
                        COD Cash Collected: ₹{data.totalAmount}
                      </p>
                    )}
                  </div>

                  {data.proofAttachments.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--muted)]">
                        Captured Doorstep Evidence
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {data.proofAttachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-black/40 hover:border-sky-500 transition"
                          >
                            <img
                              src={att.url}
                              alt={att.caption || "Proof"}
                              className="h-20 w-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[8px] text-white">
                              {att.type.replace(/_/g, " ")}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--muted)]">
                      Digital signature milestone recorded on-file.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[var(--muted)]">
                  Proof of delivery (doorstep photo & recipient signature) will appear here immediately upon customer handover.
                </div>
              )}
            </div>
          </div>

          {/* Full Audit Milestones Timeline */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Milestone Audit Trail ({data.milestones.length} Events)
                </h3>
                <p className="text-[11px] text-[var(--muted)]">
                  Immutable chronological lifecycle records captured by ERP and Rider e-POD telemetry.
                </p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
              {data.milestones.map((m) => (
                <div key={m.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-sky-500 shadow-sm" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h4 className="text-xs font-bold text-[var(--text)]">{m.title}</h4>
                    <span className="font-mono text-[10px] text-[var(--muted)]">
                      {new Date(m.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {m.description && (
                    <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--muted)] font-mono">
                    {m.location && <span>📍 {m.location}</span>}
                    {m.performedBy && <span>👤 {m.performedBy}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Printing Modals */}
      {data && printLabelOpen && (
        <OrderPrintModal
          open={printLabelOpen}
          order={data as unknown as OrderDetail}
          onClose={() => setPrintLabelOpen(false)}
        />
      )}

      {data && printLetterheadOpen && (
        <OrderLetterheadModal
          open={printLetterheadOpen}
          order={data as unknown as OrderDetail}
          onClose={() => setPrintLetterheadOpen(false)}
        />
      )}
    </div>
  );
}

