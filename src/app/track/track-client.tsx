"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT, useLocale } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Building2,
} from "lucide-react";

type TrackingEvent = {
  createdAt: string;
  eventType: string;
  message: string | null;
  status: string | null;
};

type ParcelData = {
  id: string;
  internalId: string;
  partnerAwb: string;
  status: string;
  receiverName: string;
  city: string;
  state: string;
  paymentType: string;
  codAmount: number;
  events: TrackingEvent[];
};

export default function TrackClient() {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTrack(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No shipment found matching this tracking code.");
        setParcel(null);
        return;
      }
      setParcel(data.parcel);
    } catch {
      setError("Unable to connect to tracking servers. Please check your network.");
      setParcel(null);
    } finally {
      setLoading(false);
    }
  }

  // Milestones calculation
  const getMilestoneStep = (status: string) => {
    switch (status) {
      case "EXPECTED":
        return 1;
      case "RECEIVED":
      case "WEIGHED":
      case "STORED":
      case "SORTED":
      case "READY_FOR_DISPATCH":
      case "ASSIGNED":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 2;
    }
  };

  const currentStep = parcel ? getMilestoneStep(parcel.status) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 antialiased flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <BrandLogo size="md" href="/" showWordmark={true} />
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} />
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Staff Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Track Section */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
        {/* Hero Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Tracking Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("trackHeading")}
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Enter your AWB barcode or system tracking number to view real-time location and delivery progress.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-slate-200/80">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. PAR-000001 or Partner AWB..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t("trackSubmit")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Tracking inquiry failed</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : null}

        {/* Tracking Result View */}
        {parcel ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-fadeIn space-y-6 p-6 sm:p-8">
            {/* Header / ID / Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Shipment Identifier
                </p>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {parcel.internalId}
                  </h2>
                  <span className="text-sm font-mono text-slate-500">({parcel.partnerAwb})</span>
                </div>
              </div>

              <StatusBadge status={parcel.status} size="lg" />
            </div>

            {/* Visual Milestone Stepper */}
            <div className="py-2">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { step: 1, label: "Registered", icon: Package },
                  { step: 2, label: "Warehouse Hub", icon: Building2 },
                  { step: 3, label: "Out for Delivery", icon: Truck },
                  { step: 4, label: "Delivered", icon: CheckCircle2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isDone = currentStep >= item.step;
                  const isCurrent = currentStep === item.step;
                  return (
                    <div key={item.step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${
                          isDone
                            ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        } ${isCurrent ? "ring-4 ring-cyan-500/20" : ""}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-xs mt-2 font-semibold ${
                          isDone ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Destination & Meta Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Destination</span>
                  <span className="font-bold text-slate-800">
                    {parcel.city}, {parcel.state}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Payment Mode</span>
                  <span className="font-bold text-slate-800">
                    {parcel.paymentType === "COD" ? `Cash On Delivery (₹${parcel.codAmount})` : "Prepaid Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Tracking History Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {parcel.events?.map((ev, index) => {
                  const isLatest = index === 0;
                  return (
                    <div key={ev.createdAt + index} className="relative group">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs ${
                          isLatest ? "bg-cyan-600 ring-4 ring-cyan-500/20" : "bg-slate-400"
                        }`}
                      />

                      <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-2xs hover:border-slate-200 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-slate-900">
                            {ev.message || ev.eventType.replaceAll("_", " ")}
                          </p>
                          <span className="text-[11px] font-medium text-slate-400">
                            {new Date(ev.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(ev.createdAt).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Agentic Logistics · Automated Warehouse-to-Last-Mile System</p>
      </footer>
    </div>
  );
}
