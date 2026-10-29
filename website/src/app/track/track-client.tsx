"usereact";
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ERP_URL } from "@/lib/brand";

interface Milestone {
  id: string;
  status: string;
  title: string;
  description?: string | null;
  location?: string | null;
  performedBy?: string | null;
  createdAt: string;
}

interface ProofAttachment {
  id: string;
  type: string;
  fileName: string;
  caption?: string | null;
  url: string;
}

interface CourierInfo {
  driverName: string;
  vehicleNumber: string;
  tripNumber: string;
  status: string;
}

interface PublicTrackingData {
  awbNumber: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  serviceType: string;
  paymentMode: string;
  totalAmount: number;
  packageWeight: number;
  itemDescription: string;
  createdAt: string;

  originCity: string;
  originState: string;
  originPincode: string;
  senderMasked: string;

  destinationCity: string;
  destinationState: string;
  destinationPincode: string;
  receiverMasked: string;

  stageIndex: number;
  isDelivered: boolean;
  hasNdr: boolean;
  ndrReason?: string | null;

  courier?: CourierInfo | null;
  milestones: Milestone[];
  proofAttachments: ProofAttachment[];
}

const SAMPLE_AWBS = [
  { code: "AWB-699902477", label: "Delivered • Amit Patel", status: "Delivered" },
  { code: "AWB-815606218", label: "Out for Delivery • Priya Sharma", status: "Out for Delivery" },
];

export function TrackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || "";

  const [inputAwb, setInputAwb] = useState(initialAwb);
  const [activeAwb, setActiveAwb] = useState(initialAwb);
  const [tracking, setTracking] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedProof, setSelectedProof] = useState<ProofAttachment | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const awbFromUrl = searchParams.get("awb")?.trim();
    if (awbFromUrl) {
      setInputAwb(awbFromUrl);
      setActiveAwb(awbFromUrl);
      fetchTracking(awbFromUrl);
    }
  }, [searchParams]);

  async function fetchTracking(awbToFetch: string) {
    if (!awbToFetch.trim()) return;
    setLoading(true);
    setError(null);
    setTracking(null);

    try {
      const cleanAwb = encodeURIComponent(awbToFetch.trim().toUpperCase());
      const res = await fetch(`${ERP_URL}/api/public/track/${cleanAwb}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Unable to locate consignment (${res.status})`);
      }

      const data = await res.json();
      if (data.tracking) {
        setTracking(data.tracking);
      } else {
        throw new Error("Shipment details could not be retrieved");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to retrieve shipment";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = inputAwb.trim().toUpperCase();
    if (!clean) return;

    startTransition(() => {
      router.push(`/track?awb=${encodeURIComponent(clean)}`);
    });
  }

  function handleSelectSample(code: string) {
    setInputAwb(code);
    startTransition(() => {
      router.push(`/track?awb=${encodeURIComponent(code)}`);
    });
  }

  function handleCopyAwb(code: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const stages = [
    { label: "Booked", subtext: "Facility Registered" },
    { label: "In Transit", subtext: "Intermodal Haulage" },
    { label: "Out for Delivery", subtext: "Courier Dispatched" },
    { label: "Delivered", subtext: "Verified Handover" },
  ];

  const currentStageIndex = tracking ? Math.min(Math.max(tracking.stageIndex, 0), 3) : 0;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-5xl">
        {/* ─── Breadcrumb & Kicker ─── */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">Consignment Telemetry</span>
        </div>

        {/* ─── Search Hero Header ─── */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0c1222]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                LIVE SATELLITE & HUB TELEMETRY
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Track Consignment
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl">
              Inspect real-time autonomous routing, carrier milestones, assigned rider dispatch telemetry, and verified electronic proof-of-delivery (e-POD).
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={inputAwb}
                  onChange={(e) => setInputAwb(e.target.value)}
                  placeholder="Enter 9-digit AWB or Order # (e.g. AWB-699902477)"
                  className="w-full rounded-2xl border border-white/10 bg-[#070b14]/90 pl-11 pr-4 py-3.5 text-sm sm:text-base font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner uppercase tracking-wider transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputAwb.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Locating...
                  </span>
                ) : (
                  <>
                    <span>Locate Shipment</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Samples */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Quick Demo Samples:</span>
              {SAMPLE_AWBS.map((sample) => (
                <button
                  key={sample.code}
                  type="button"
                  onClick={() => handleSelectSample(sample.code)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1 font-mono text-[11px] text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <span className="font-bold">{sample.code}</span>
                  <span className="text-slate-400">({sample.status})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── State: Loading Skeleton ─── */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-[#0c1222] p-8 shadow-xl animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 bg-slate-800 rounded-lg" />
              <div className="h-8 w-28 bg-slate-800 rounded-full" />
            </div>
            <div className="h-16 w-full bg-slate-800/60 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-slate-800/40 rounded-2xl" />
              <div className="h-32 bg-slate-800/40 rounded-2xl" />
            </div>
          </div>
        )}

        {/* ─── State: Error / Not Found ─── */}
        {error && !loading && (
          <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 text-center shadow-xl mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Consignment Not Located</h2>
            <p className="mt-2 text-sm text-red-300 max-w-md mx-auto">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleSelectSample("AWB-699902477")}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Try Sample Consignment
              </button>
              <Link
                href="/contact"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Contact Support Desk
              </Link>
            </div>
          </div>
        )}

        {/* ─── State: Empty State (No search yet) ─── */}
        {!tracking && !loading && !error && (
          <div className="rounded-3xl border border-white/10 bg-[#0c1222]/60 p-8 sm:p-12 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Ready for Real-Time Telemetry</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Please enter your Air Waybill number or Order reference above to begin tracking. You can find this on your dispatch label, SMS notification, or billing invoice.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {SAMPLE_AWBS.map((s) => (
                <button
                  key={s.code}
                  onClick={() => handleSelectSample(s.code)}
                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 text-xs font-mono font-medium text-blue-300 transition-colors"
                >
                  Track {s.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── State: Active Tracking Details ─── */}
        {tracking && !loading && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Primary Status Header Card */}
            <div className="rounded-3xl border border-white/10 bg-[#0c1222] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {tracking.awbNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(tracking.awbNumber)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-1 text-[11px] font-mono text-slate-300 transition-colors"
                      title="Copy AWB number"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-mono text-slate-400 border border-white/5">
                      Ref: {tracking.orderNumber}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>
                      Service: <strong className="text-slate-200">{tracking.serviceType.replace(/_/g, " ")}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Weight: <strong className="text-slate-200">{tracking.packageWeight} kg</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Payment:{" "}
                      <strong className={tracking.paymentMode === "COD" ? "text-amber-400" : "text-emerald-400"}>
                        {tracking.paymentMode} {tracking.paymentMode === "COD" ? `(₹${tracking.totalAmount.toLocaleString()})` : ""}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-start md:items-end">
                  <div
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold shadow-lg ${
                      tracking.isDelivered
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-950/40"
                        : tracking.hasNdr
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-950/40"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-blue-950/40"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        tracking.isDelivered
                          ? "bg-emerald-400"
                          : tracking.hasNdr
                          ? "bg-amber-400 animate-ping"
                          : "bg-blue-400 animate-pulse"
                      }`}
                    />
                    <span>{tracking.statusLabel}</span>
                  </div>
                  <span className="mt-2 text-[11px] text-slate-400">
                    Booked {new Date(tracking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* 2. Four-Stage Visual Progress Bar */}
              <div className="pt-8 pb-4">
                <div className="relative">
                  {/* Connecting Track Line */}
                  <div className="absolute top-5 left-6 right-6 h-1 bg-slate-800 rounded-full" />
                  <div
                    className="absolute top-5 left-6 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${(currentStageIndex / (stages.length - 1)) * 92}%`,
                    }}
                  />

                  {/* Stepper Dots & Labels */}
                  <div className="relative z-10 flex justify-between">
                    {stages.map((stage, idx) => {
                      const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && tracking.isDelivered);
                      const isCurrent = idx === currentStageIndex && !tracking.isDelivered;

                      return (
                        <div key={stage.label} className="flex flex-col items-center text-center max-w-[100px] sm:max-w-[140px]">
                          <div
                            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              isCompleted
                                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                                : isCurrent
                                ? "bg-blue-600 text-white ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/40 animate-pulse"
                                : "bg-slate-900 border border-white/10 text-slate-500"
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span>0{idx + 1}</span>
                            )}
                          </div>
                          <span
                            className={`mt-3 text-xs sm:text-sm font-semibold ${
                              isCompleted || isCurrent ? "text-white" : "text-slate-500"
                            }`}
                          >
                            {stage.label}
                          </span>
                          <span className="hidden sm:inline-block mt-0.5 text-[10px] text-slate-400 font-mono">
                            {stage.subtext}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Bilateral Route & Origin / Destination Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin Facility */}
              <div className="rounded-3xl border border-white/10 bg-[#0c1222] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                      ORIGIN HUB
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {tracking.originCity}, {tracking.originState}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-400 border-t border-white/5 pt-3">
                  <div className="flex justify-between">
                    <span>Postal Pincode:</span>
                    <span className="font-mono text-slate-200">{tracking.originPincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipper / Consignor:</span>
                    <span className="font-mono text-slate-200">{tracking.senderMasked}</span>
                  </div>
                </div>
              </div>

              {/* Destination Facility */}
              <div className="rounded-3xl border border-white/10 bg-[#0c1222] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      DESTINATION HUB
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {tracking.destinationCity}, {tracking.destinationState}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-400 border-t border-white/5 pt-3">
                  <div className="flex justify-between">
                    <span>Postal Pincode:</span>
                    <span className="font-mono text-slate-200">{tracking.destinationPincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipient / Consignee:</span>
                    <span className="font-mono text-slate-200">{tracking.receiverMasked}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Active Courier Driver & Telemetry (if dispatched) */}
            {tracking.courier && (
              <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-[#0c1222] to-[#0c1222] p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                          ASSIGNED COURIER RIDER
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          On Route
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-0.5">{tracking.courier.driverName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>
                          Vehicle: <strong className="font-mono text-slate-200">{tracking.courier.vehicleNumber}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Runsheet Trip: <strong className="font-mono text-slate-200">{tracking.courier.tripNumber}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="tel:+918000000000"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contact Dispatch Desk
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Verified Proof of Delivery (e-POD) Card */}
            {tracking.isDelivered && (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        VERIFIED ELECTRONIC PROOF OF DELIVERY
                      </span>
                      <h3 className="text-lg font-bold text-white">Consignment Successfully Handed Over</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                    Tamper-Sealed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Handover Status</span>
                    <p className="mt-1 text-sm font-semibold text-white">Signed & Delivered</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Cash on Delivery</span>
                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      {tracking.paymentMode === "COD" ? `₹${tracking.totalAmount.toLocaleString()} Collected` : "Prepaid (₹0 Due)"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">e-POD Records</span>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {tracking.proofAttachments.length} Digital Attachment{tracking.proofAttachments.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {/* Proof Thumbnails */}
                {tracking.proofAttachments.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-3">
                      Digital Proofs & Signatures:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {tracking.proofAttachments.map((proof) => (
                        <div
                          key={proof.id}
                          onClick={() => setSelectedProof(proof)}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#070b14] hover:border-blue-500 transition-all p-2 flex flex-col items-center justify-center text-center"
                        >
                          {proof.url.startsWith("data:image") ? (
                            <div className="relative w-full h-24 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                              <img
                                src={proof.url}
                                alt={proof.caption || "Proof"}
                                className="max-h-full max-w-full object-contain filter invert opacity-90 group-hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-24 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <span className="mt-2 text-[11px] font-mono font-medium text-slate-300 truncate w-full">
                            {proof.caption || proof.type}
                          </span>
                          <span className="text-[9px] text-blue-400 font-semibold group-hover:underline mt-0.5">
                            Click to View High-Res
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Milestone Audit Trail Timeline */}
            <div className="rounded-3xl border border-white/10 bg-[#0c1222] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Transit Milestones & Audit Trail</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological immutable ledger of all hub scans, dispatches, and handovers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Receipt</span>
                </button>
              </div>

              <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-6">
                {tracking.milestones.map((milestone, idx) => {
                  const isLatest = idx === 0;

                  return (
                    <div key={milestone.id || idx} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                          isLatest
                            ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/50"
                            : "bg-[#070b14] border-white/20 text-slate-500"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isLatest ? "bg-white animate-pulse" : "bg-slate-500"
                          }`}
                        />
                      </div>

                      {/* Milestone Event Card */}
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 group-hover:bg-white/[0.04] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{milestone.title}</span>
                            {isLatest && (
                              <span className="rounded-md bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-300 font-semibold">
                                LATEST
                              </span>
                            )}
                          </h4>
                          <span className="font-mono text-xs text-slate-400">
                            {new Date(milestone.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            •{" "}
                            {new Date(milestone.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {milestone.description && (
                          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                            {milestone.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          {milestone.location && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="text-slate-300">{milestone.location}</span>
                            </span>
                          )}
                          {milestone.performedBy && (
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <span>Auth:</span>
                              <span className="text-slate-300">{milestone.performedBy}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Lightbox Modal for High-Res Proof Attachment ─── */}
        {selectedProof && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => setSelectedProof(null)}
          >
            <div
              className="relative max-w-xl w-full rounded-3xl border border-white/20 bg-[#0c1222] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedProof.caption || selectedProof.type}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Electronic Handover Verification Record
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#070b14] p-4 flex items-center justify-center min-h-[260px]">
                {selectedProof.url.startsWith("data:image") ? (
                  <img
                    src={selectedProof.url}
                    alt={selectedProof.caption || "e-POD Proof"}
                    className="max-h-[380px] max-w-full object-contain filter invert"
                  />
                ) : (
                  <div className="text-sm text-slate-400">Proof document attachment</div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Tamper-Proof Digital Verification</span>
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 font-semibold text-white transition-colors"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

