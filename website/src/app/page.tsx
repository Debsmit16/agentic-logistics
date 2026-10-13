import Image from "next/image";
import Link from "next/link";
import { ERP_URL } from "@/lib/brand";
import { LogoCube3D } from "@/components/3d/logo-cube-3d";
import { LogoShowcasePanel } from "@/components/3d/logo-showcase-panel";

export default function HomePage() {
  const operations = [
    {
      title: "Autonomous Fleet & Highway Haulage",
      category: "GROUND TRANSPORT",
      badge: "42 TERMINALS",
      desc: "Heavy-duty electric freight haulers synchronized with high-bay loading docks, automated dispatch queues, and sub-meter GPS telemetry.",
      image: "/logistics-fleet-terminal.jpg",
      metric: "1,280+ Dispatches / Day",
    },
    {
      title: "Express Air Cargo & Express Charters",
      category: "AEROSPACE FREIGHT",
      badge: "GLOBAL CORRIDORS",
      desc: "Widebody cargo aircraft handling priority air waybills and certified ULD containers across Asia, Europe, and North America.",
      image: "/air-cargo-global.jpg",
      metric: "Sub-24h Cross-Border",
    },
    {
      title: "Automated High-Bay Robotics & Sorting",
      category: "FULFILLMENT CORE",
      badge: "ROBOTIC AMRs",
      desc: "Intelligent autonomous mobile sorting robots, precision conveyor telemetry, and automated container handling with zero dwell time.",
      image: "/smart-warehouse-robotics.jpg",
      metric: "99.98% Sort Accuracy",
    },
    {
      title: "Maritime Container & Rail Intermodal",
      category: "PORT LOGISTICS",
      badge: "DEEPWATER HUBS",
      desc: "Smart port terminal synchronization connecting mega-container vessels directly with railheads and automated bonded container yards.",
      image: "/maritime-port-cargo.jpg",
      metric: "50k+ TEU Monthly Capacity",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ─── 1. HERO SECTION WITH 3D LOGO EMBLEM ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-200/80 dark:border-white/10">
        {/* Ambient Logistics Terminal Backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-35 dark:opacity-25">
          <Image
            src="/logistics-fleet-terminal.jpg"
            alt="Agentic Logistics Enterprise Facility"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white dark:from-[#070b14]/85 dark:via-[#070b14]/95 dark:to-[#070b14]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Kicker badge with official logo emblem */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-md mb-6 shadow-xs">
                <Image
                  src="/logo-64.png"
                  alt="Agentic Emblem"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span className="font-mono text-[11px] tracking-wider uppercase">
                  ENTERPRISE FREIGHT ORCHESTRATION
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.04]">
                Global Logistics. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
                  Autonomous Precision.
                </span>
              </h1>

              {/* Subtext */}
              <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
                Powering autonomous fleet dispatching, intermodal air and ocean freight, and real-time robotic reconciliation across 42 certified global distribution gateways.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={ERP_URL}
                  className="px-7 py-3.5 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-slate-900/15 dark:shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <Image src="/logo-64.png" alt="Logo" width={18} height={18} className="brightness-200" />
                  <span>Launch ERP Console</span>
                  <span className="text-xs">→</span>
                </a>
                <Link
                  href="/solutions"
                  className="px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm transition-all shadow-xs"
                >
                  Explore Solutions
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white font-semibold text-sm transition-colors"
                >
                  Request Consultation →
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> 42 Connected Gateways
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Sub-50ms Telemetry
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> ISO 27001 & SOC 2 Certified
                </span>
              </div>
            </div>

            {/* Right: Interactive 3D Logo Cube Experience */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-b from-blue-950/20 via-slate-900/40 to-slate-950/70 dark:bg-gradient-to-b dark:from-blue-950/40 dark:via-slate-900/70 dark:to-[#070b14] border border-blue-500/20 shadow-2xl p-4 flex items-center justify-center backdrop-blur-xl">
                {/* Ambient glow backdrop */}
                <div className="absolute inset-0 bg-blue-500/15 blur-3xl pointer-events-none rounded-full" />
                
                {/* 3D Model */}
                <LogoCube3D className="w-full h-full" interactive={true} />

                {/* Floating telemetry HUD card */}
                <div className="pointer-events-none absolute top-4 left-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 shadow-md backdrop-blur-md text-[10px] font-mono text-slate-700 dark:text-slate-200">
                  <span className="text-emerald-500 font-bold">●</span> ACTIVE 3D TELEMETRY BEACON
                </div>

                <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 shadow-md backdrop-blur-md text-[10px] font-mono text-blue-600 dark:text-blue-400">
                  42 ORBITAL NODES
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-3 font-mono">
                Interactive 3D Emblem • Rotate & drag to explore
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. ENTERPRISE METRICS BAND ─── */}
      <section className="bg-slate-50 dark:bg-[#0c1222] py-12 border-b border-slate-200/80 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-4 border-l-2 border-blue-600">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">42</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Distribution Hubs
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Certified multi-modal gateways globally</p>
            </div>
            <div className="p-4 border-l-2 border-indigo-600">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">1,280+</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Daily Fleet Dispatches
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Autonomous routing & zero dwell time</p>
            </div>
            <div className="p-4 border-l-2 border-emerald-500">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">99.98%</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                SLA Fulfillment
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Contract-backed guaranteed delivery</p>
            </div>
            <div className="p-4 border-l-2 border-sky-500">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">48ms</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Edge Telemetry
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Sub-second hardware synchronization</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. LOGISTICS OPERATIONS SHOWCASE (PHOTOGRAPHIC FLEET GALLERY) ─── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider">MULTI-MODAL FLEET & INFRASTRUCTURE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              End-to-End Autonomous Cargo Network
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Every truck, aircraft cargo container, autonomous mobile robot, and intermodal vessel operates under the Agentic Logistics unified telemetry standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {operations.map((op) => (
              <div
                key={op.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Branded Logistics Imagery */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <Image
                    src={op.image}
                    alt={op.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-blue-400 backdrop-blur-md border border-white/10">
                      {op.category}
                    </span>
                    <span className="rounded-lg bg-emerald-500/90 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-white backdrop-blur-md">
                      {op.badge}
                    </span>
                  </div>

                  {/* Metric on image bottom */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Image src="/logo-64.png" alt="Emblem" width={20} height={20} className="object-contain" />
                    <span className="text-xs font-mono font-bold text-white bg-blue-600/80 px-2.5 py-0.5 rounded-md backdrop-blur-md">
                      {op.metric}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {op.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {op.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <Link
                      href="/solutions"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View Operational Specs →
                    </Link>
                    <span className="text-[11px] font-mono text-slate-400">Agentic Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. DEDICATED 3D LOGO BEACON SHOWCASE PANEL ─── */}
      <section className="py-12 lg:py-20 mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <LogoShowcasePanel />
      </section>

      {/* ─── 5. ENTERPRISE ACCREDITATIONS & SECURITY ─── */}
      <section className="bg-slate-50 dark:bg-[#070e1c] py-16 border-t border-b border-slate-200/80 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/logo-128.png" alt="Agentic Logistics" width={32} height={32} className="object-contain" />
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Agentic Logistics Enterprise Standards
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Meeting the strictest global standards for aerospace cargo, cold-chain pharmaceuticals, and defense-grade chain of custody.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">ISO 27001</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Information Security</div>
              <div className="text-[10px] text-slate-400 mt-1">Audited Global Nodes</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">SOC 2 Type II</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">System & Cloud Trust</div>
              <div className="text-[10px] text-slate-400 mt-1">Continuous Uptime</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">GDP Pharma</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Cold Chain Standard</div>
              <div className="text-[10px] text-slate-400 mt-1">Continuous Thermal IoT</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">C-TPAT Tier 3</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Customs Trade Partner</div>
              <div className="text-[10px] text-slate-400 mt-1">Express Fast-Track</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. CALL TO ACTION ─── */}
      <section className="bg-[#0f172a] text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <Image
            src="/agentic-enterprise-hero.jpg"
            alt="Agentic Logistics HQ"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-xl">
            <Image src="/logo-128.png" alt="Agentic Logistics" width={40} height={40} className="object-contain" />
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
            Accelerate Your Enterprise Supply Chain
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Access the complete operations console or speak directly with our logistics solutions team to integrate Agentic Logistics across your fleet.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={ERP_URL}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <Image src="/logo-64.png" alt="Logo" width={18} height={18} className="brightness-200" />
              <span>Sign In to ERP Console →</span>
            </a>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-2xl border border-white/25 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
            >
              Request Enterprise Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
