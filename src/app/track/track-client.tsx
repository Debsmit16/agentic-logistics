"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT, useLocale } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 antialiased flex flex-col justify-between">
      {/* Top Navbar with Theme Toggle */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-xl sticky top-0 z-20 shadow-[var(--card-shadow)]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <BrandLogo size="md" href="/" showWordmark={true} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher current={locale} />
            <Link
              href="/login"
              className="skeuo-btn skeuo-btn-secondary text-xs px-3.5 py-1.5"
            >
              Operations Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Track Section */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
        {/* Hero Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-glow)] border border-[var(--accent-primary)]/40 text-[var(--accent-primary)] text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public Tracking Portal · End-to-End Verified</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
            {t("trackHeading")}
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Real-time telemetry, location scans, and delivery milestones.
          </p>
        </div>

        {/* Tactile Search Input Box */}
        <div className="skeuo-card p-3 sm:p-4">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. PAR-000001 or Partner AWB..."
                className="skeuo-input w-full pl-12 pr-4 py-3.5 text-base font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="skeuo-btn skeuo-btn-primary px-7 py-3.5 text-sm font-bold gap-2"
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
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Shipment Not Located</p>
              <p className="text-xs text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
        ) : null}

        {/* Tracking Result View */}
        {parcel ? (
          <div className="skeuo-card overflow-hidden animate-fadeIn space-y-6 p-6 sm:p-8">
            {/* Header / ID / Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Live Consignment Record
                </p>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight font-mono">
                    {parcel.internalId}
                  </h2>
                  <span className="text-xs font-mono text-[var(--text-muted)]">({parcel.partnerAwb})</span>
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
                        className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                          isDone
                            ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-[0_0_16px_var(--accent-glow)] ring-1 ring-white/20"
                            : "bg-[var(--bg-surface-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                        } ${isCurrent ? "ring-4 ring-cyan-500/30 scale-105" : ""}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-xs mt-2 font-bold ${
                          isDone ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-[var(--bg-surface-muted)] h-2 rounded-full mt-4 overflow-hidden border border-[var(--border-subtle)] shadow-inner">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Destination & Meta Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] shadow-inner text-xs">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                <div>
                  <span className="text-[var(--text-muted)] block font-medium">Destination</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {parcel.city}, {parcel.state}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                <div>
                  <span className="text-[var(--text-muted)] block font-medium">Payment Protocol</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {parcel.paymentType === "COD" ? `Cash On Delivery (₹${parcel.codAmount})` : "Prepaid Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Consignment Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                {parcel.events?.map((ev, index) => {
                  const isLatest = index === 0;
                  return (
                    <div key={ev.createdAt + index} className="relative group">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-surface)] shadow-md ${
                          isLatest ? "bg-cyan-500 ring-4 ring-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-slate-500"
                        }`}
                      />

                      <div className="skeuo-card p-3.5 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-[var(--text-primary)]">
                            {ev.message || ev.eventType.replaceAll("_", " ")}
                          </p>
                          <span className="text-[11px] font-medium text-[var(--text-muted)]">
                            {new Date(ev.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
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
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 text-center text-xs text-[var(--text-muted)]">
        <p>© {new Date().getFullYear()} Agentic Logistics · Automated Warehouse-to-Last-Mile Operating Platform</p>
      </footer>
    </div>
  );
}
