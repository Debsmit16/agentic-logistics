"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useT } from "@/components/i18n/i18n-provider";
import {
  Package,
  Truck,
  Warehouse,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Clock,
  MapPin,
  TrendingUp,
  BarChart3,
  Layers,
  Radio,
  FileText,
  UserCheck,
  Zap,
  Activity,
  Check,
  Cpu,
  Key,
} from "lucide-react";

interface HomeClientProps {
  locale: string;
}

const DEMO_AWBS = [
  {
    awb: "AWB-DEL-9842",
    status: "OUT_FOR_DELIVERY",
    origin: "Delhi Central Hub (DEL-01)",
    dest: "Gurugram Tech Park, Sector 44",
    rider: "Vikram Malhotra (ID: R-408)",
    eta: "18 Mins",
    items: "Apple MacBook Pro M3 · 2.1 kg",
    cod: "₹ 0 (Prepaid)",
    progress: 75,
  },
  {
    awb: "AWB-MUM-4821",
    status: "RECEIVED_AT_HUB",
    origin: "Bhiwandi Mega Fulfillment",
    dest: "Bandra Kurla Complex, Mumbai",
    rider: "Pending Dispatch Batch #42",
    eta: "Tomorrow 11:30 AM",
    items: "Medical Diagnostics Kit · 0.8 kg",
    cod: "₹ 2,450 (COD Due)",
    progress: 35,
  },
  {
    awb: "AWB-BLR-7719",
    status: "DELIVERED",
    origin: "Whitefield Sorter Hub",
    dest: "Indiranagar 100ft Rd, Bangalore",
    rider: "Priya Sharma (Signed on Glass)",
    eta: "Delivered Today at 14:22",
    items: "Precision Optical Sensors · 1.4 kg",
    cod: "₹ 0 (Prepaid)",
    progress: 100,
  },
];

export function HomeClient({ locale }: HomeClientProps) {
  const t = useT();
  const [selectedAwb, setSelectedAwb] = useState(DEMO_AWBS[0]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Dynamic Ambient Background Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[20%] w-[550px] h-[450px] rounded-full bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-transparent blur-[120px]" />
        <div className="absolute top-[10%] right-[15%] w-[480px] h-[400px] rounded-full bg-gradient-to-bl from-blue-600/15 via-indigo-500/10 to-transparent blur-[110px]" />
      </div>

      {/* ====================================================================
          STICKY SKEUOMORPHIC NAVIGATION BAR
          ==================================================================== */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[var(--bg-surface)]/85 border-b border-[var(--border-subtle)] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BrandLogo size="md" showWordmark href="/" />
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <a
                href="#features"
                className="px-3.5 py-2 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors"
              >
                Architecture
              </a>
              <a
                href="#telemetry"
                className="px-3.5 py-2 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors"
              >
                Telemetry
              </a>
              <a
                href="#personas"
                className="px-3.5 py-2 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors"
              >
                Demo Personas
              </a>
              <Link
                href="/track"
                className="px-3.5 py-2 rounded-lg text-[var(--accent-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track AWB</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block h-4 w-px bg-[var(--border-subtle)]" />
            <div className="hidden sm:block">
              <LanguageSwitcher current={locale} />
            </div>
            <Link
              href="/login"
              className="skeuo-btn skeuo-btn-primary skeuo-btn-sm font-bold shadow-sm"
            >
              <span>Control Plane</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ====================================================================
          HERO SECTION (LUXURY SKEUOMORPHIC DISPLAY)
          ==================================================================== */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Status Indicator Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--btn-secondary-shadow)] text-xs font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            </span>
            <span className="text-[var(--text-primary)]">Agentic Logistics OS v2.5</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--accent-primary)] font-extrabold">
              Autonomous Fleet Routing Live
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.08]">
            High-Precision <br />
            <span className="bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
              Autonomous Logistics
            </span>{" "}
            & Freight OS
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-normal max-w-2xl mx-auto leading-relaxed">
            Mission-critical platform engineered for hyper-local fulfillment, intelligent warehouse sortation, real-time rider telematics, and automated GST reconciliation.
          </p>

          {/* Master CTA Button Cluster */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="skeuo-btn skeuo-btn-primary skeuo-btn-lg w-full sm:w-auto font-bold shadow-lg gap-2.5 text-base"
            >
              <span>Access Control Plane</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/track"
              className="skeuo-btn skeuo-btn-secondary skeuo-btn-lg w-full sm:w-auto font-bold gap-2.5 text-base"
            >
              <Search className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>Track Any Consignment</span>
            </Link>

            <a
              href="#personas"
              className="skeuo-btn skeuo-btn-secondary skeuo-btn-lg w-full sm:w-auto font-bold gap-2 text-base text-[var(--text-secondary)]"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>Demo Logins</span>
            </a>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Zero-Trust RBAC
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-500" />
              Neon Postgres Powered
            </span>
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-blue-500" />
              Sub-Second Telemetry
            </span>
          </div>
        </div>

        {/* ====================================================================
            INTERACTIVE LIVE TELEMETRY SIMULATOR CONSOLE
            ==================================================================== */}
        <div id="telemetry" className="mt-16 max-w-5xl mx-auto">
          <div className="skeuo-card p-6 sm:p-8 overflow-hidden">
            {/* Top Specular Edge Line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Console Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border-subtle)] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Live Consignment Telemetry Simulator
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Simulate real-time GPS breadcrumbs, sortation checkpoints, and proof of delivery
                  </p>
                </div>
              </div>

              {/* Sample Selector Chips */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hidden lg:inline">
                  Sample AWBs:
                </span>
                {DEMO_AWBS.map((sample) => (
                  <button
                    key={sample.awb}
                    onClick={() => setSelectedAwb(sample)}
                    className={`skeuo-btn skeuo-btn-xs font-mono font-bold transition-all ${
                      selectedAwb.awb === sample.awb
                        ? "skeuo-btn-primary"
                        : "skeuo-btn-secondary"
                    }`}
                  >
                    {sample.awb.replace("AWB-", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Telemetry Panel */}
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Shipment Specs */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] shadow-inner space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-[var(--accent-primary)]">
                      {selectedAwb.awb}
                    </span>
                    <span
                      className={`skeuo-badge px-2.5 py-0.5 text-[11px] ${
                        selectedAwb.status === "DELIVERED"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : selectedAwb.status === "OUT_FOR_DELIVERY"
                          ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 animate-pulseGlow"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {selectedAwb.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-[var(--text-secondary)]">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {selectedAwb.items}
                    </p>
                    <p>
                      <strong className="text-[var(--text-muted)] font-medium">Payment:</strong>{" "}
                      {selectedAwb.cod}
                    </p>
                    <p>
                      <strong className="text-[var(--text-muted)] font-medium">Assigned:</strong>{" "}
                      {selectedAwb.rider}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-bold">Estimated Delivery</span>
                    <span className="font-extrabold text-[var(--text-primary)] flex items-center gap-1 text-sky-500">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedAwb.eta}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500 shadow-sm"
                      style={{ width: `${selectedAwb.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Center & Right Column: Interactive Checkpoints Stepper */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] shadow-inner flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Waypoint Chain & Checkpoint History
                    </span>
                    <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-ping" />
                      Live GPS Sync
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs">
                      <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          Origin Sorting & Ingestion Scan
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {selectedAwb.origin}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs">
                      <div className="p-2 rounded-lg bg-sky-500/15 text-sky-500 shrink-0">
                        <Warehouse className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          Automated Shelf Sort & Weight Verifier
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Rack B2 · Weight Verified (2.10 kg) · Barcode Matched
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          selectedAwb.progress >= 75
                            ? "bg-blue-500/15 text-blue-500"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          Last-Mile Dispatch & Consignee Drop
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {selectedAwb.dest}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[var(--border-subtle)] mt-4">
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    Try entering your own consignment code:
                  </span>
                  <Link
                    href={`/track?awb=${selectedAwb.awb}`}
                    className="skeuo-btn skeuo-btn-primary skeuo-btn-xs font-bold gap-1.5"
                  >
                    <span>Full Live Tracker</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          CORE CAPABILITIES (TACTILE BENTO GRID)
          ==================================================================== */}
      <section id="features" className="py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Engineered for Precision at Scale
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)]">
              Modular micro-services coordinating fulfillment hubs, last-mile couriers, and financial reconciliation in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1: Warehouse Sortation */}
            <div className="skeuo-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/20 mb-5">
                  <Warehouse className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  Smart Warehouse Sortation
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Dynamic physical shelf matrix (Racks A1–D4), automated scale intake verification, barcode scanning, and instant parcel routing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                <span>Barcode & Shelf Sync</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Bento Card 2: Fleet Telematics */}
            <div className="skeuo-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/20 mb-5">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  Fleet GPS & Turn-by-Turn
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Autonomous batch creation, optimal multi-stop driver dispatching, live rider speed telemetry, and digital signatures on glass.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                <span>Rider Breadcrumbs</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Bento Card 3: GST & COD Finance */}
            <div className="skeuo-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/20 mb-5">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  GST Invoicing & COD Ledger
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Automated HSN/SAC 9965 compliant tax invoices, CGST/SGST/IGST computations, and real-time cash settlement reconciliation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                <span>Zero Cash Leakage</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Bento Card 4: Multi-Language & RBAC */}
            <div className="skeuo-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/20 mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  Enterprise RBAC & i18n
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Multi-lingual operations supporting English, Bengali, and Hindi. Granular role-based permissions with audit logs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                <span>EN / BN / HI Native</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          ONE-CLICK DEMO ACCESS MATRIX
          ==================================================================== */}
      <section id="personas" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Key className="w-3.5 h-3.5" />
            <span>Instant Evaluator Access</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Test Drive by Operational Role
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Jump directly into the control plane with pre-seeded test credentials. Zero setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Persona 1: Superadmin */}
          <div className="skeuo-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="skeuo-badge px-2.5 py-0.5 text-[10px] bg-red-500/15 text-red-500 border border-red-500/30">
                ROLE: OWNER / SUPERADMIN
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Executive Command</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Full visibility across live parcels, revenue ledger, fleet GPS, and system settings.
              </p>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface-muted)] text-[11px] font-mono text-[var(--text-muted)] space-y-1">
                <p>owner@agentic.local</p><p>Password: changeme123</p>
              </div>
            </div>
            <Link
              href="/login?email=owner@agentic.local"
              className="mt-5 skeuo-btn skeuo-btn-primary w-full py-2.5 text-xs font-bold gap-1.5"
            >
              <span>Login as Owner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 2: Warehouse Staff */}
          <div className="skeuo-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="skeuo-badge px-2.5 py-0.5 text-[10px] bg-sky-500/15 text-sky-500 border border-sky-500/30">
                ROLE: WAREHOUSE MANAGER
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Fulfillment & Shelf Hub</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Intake scanning, weight capture, physical rack sorting, and shipping label generation.
              </p>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface-muted)] text-[11px] font-mono text-[var(--text-muted)] space-y-1">
                <p>warehouse@demo.agentic.local</p>
                <p>Password: demo123456</p>
              </div>
            </div>
            <Link
              href="/login?email=warehouse@demo.agentic.local"
              className="mt-5 skeuo-btn skeuo-btn-secondary w-full py-2.5 text-xs font-bold gap-1.5"
            >
              <span>Login as Warehouse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 3: Delivery Rider */}
          <div className="skeuo-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="skeuo-badge px-2.5 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                ROLE: DELIVERY RIDER
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Mobile Rider Console</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Assigned batch list, turn-by-turn navigation, digital signature capture, and COD collected.
              </p>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface-muted)] text-[11px] font-mono text-[var(--text-muted)] space-y-1">
                <p>rider@demo.agentic.local</p>
                <p>Password: demo123456</p>
              </div>
            </div>
            <Link
              href="/login?email=rider@demo.agentic.local"
              className="mt-5 skeuo-btn skeuo-btn-emerald w-full py-2.5 text-xs font-bold gap-1.5"
            >
              <span>Login as Rider</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Persona 4: Finance Accountant */}
          <div className="skeuo-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="skeuo-badge px-2.5 py-0.5 text-[10px] bg-purple-500/15 text-purple-500 border border-purple-500/30">
                ROLE: ACCOUNTANT
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">GST & Cash Settlements</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Print tax invoices, verify rider cash remittances, and inspect HSN/SAC audit logs.
              </p>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface-muted)] text-[11px] font-mono text-[var(--text-muted)] space-y-1">
                <p>accounts@demo.agentic.local</p>
                <p>Password: demo123456</p>
              </div>
            </div>
            <Link
              href="/login?email=accounts@demo.agentic.local"
              className="mt-5 skeuo-btn skeuo-btn-secondary w-full py-2.5 text-xs font-bold gap-1.5"
            >
              <span>Login as Accountant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          ENTERPRISE FOOTER
          ==================================================================== */}
      <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" showWordmark href="/" />
            <span className="text-xs text-[var(--text-muted)]">
              © 2026 Agentic Logistics Inc. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)] font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span>All Systems Operational (99.98% SLA)</span>
            </div>
            <Link href="/track" className="hover:text-[var(--text-primary)]">
              Public Tracking
            </Link>
            <Link href="/login" className="hover:text-[var(--text-primary)]">
              Employee Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


