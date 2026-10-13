import Image from "next/image";
import Link from "next/link";
import { ERP_URL } from "@/lib/brand";

export const metadata = {
  title: "Global Distribution Network | Agentic Logistics",
  description: "Explore the 42 strategic logistics hubs and gateways operated by Agentic Logistics worldwide.",
};

export default function NetworkPage() {
  const hubs = [
    { code: "BOM", name: "Mumbai Central Gateway", region: "India Core (APAC)", type: "Multi-Modal Intermodal", capacity: "98.2%", status: "OPTIMAL" },
    { code: "DEL", name: "Delhi Dispatch Core", region: "Northern Corridor", type: "Air Cargo & Highway", capacity: "94.6%", status: "OPTIMAL" },
    { code: "BLR", name: "Bengaluru Logistics Node", region: "South Tech Corridor", type: "Automated Robotics Hub", capacity: "99.1%", status: "OPTIMAL" },
    { code: "DXB", name: "Dubai Freight Gateway", region: "Middle East Node", type: "Transshipment Cross-Dock", capacity: "96.4%", status: "OPTIMAL" },
    { code: "SIN", name: "Singapore Maritime Node", region: "Southeast Asia", type: "Deepwater Port Berth", capacity: "97.8%", status: "OPTIMAL" },
    { code: "HND", name: "Tokyo Air Terminal", region: "East Asia Corridor", type: "Express Aerospace ULD", capacity: "93.5%", status: "OPTIMAL" },
    { code: "FRA", name: "Frankfurt Cargo Core", region: "Central Europe", type: "Trans-European Rail & Air", capacity: "98.7%", status: "OPTIMAL" },
    { code: "LHR", name: "London Logistics Core", region: "Western Europe", type: "Bonded Customs Gateway", capacity: "95.9%", status: "OPTIMAL" },
    { code: "JFK", name: "New York Port Gateway", region: "North America East", type: "Air Cargo & Port Terminal", capacity: "97.2%", status: "OPTIMAL" },
  ];

  return (
    <div className="py-16 lg:py-24 mx-auto max-w-7xl px-6 lg:px-8">
      {/* Header with Visual Backdrop */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-900 text-white p-8 sm:p-12 mb-16 shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <Image src="/agentic-enterprise-hero.jpg" alt="Distribution Facilities" fill className="object-cover" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md mb-4">
            <Image src="/logo-64.png" alt="Logo" width={16} height={16} />
            <span className="font-mono text-[11px] uppercase tracking-wider">42 CONNECTED GATEWAYS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Global Distribution Network
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every distribution hub in the Agentic network is equipped with synchronized automated dock bays, autonomous mobile sorting robots, and edge telemetry relays.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Network Status</span>
              <span className="text-sm font-bold font-mono text-emerald-400">100% OPERATIONAL</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Freight Nodes</span>
              <span className="text-sm font-bold font-mono text-white">42 Global Terminals</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Avg Gate Ingress</span>
              <span className="text-sm font-bold font-mono text-blue-400">&lt; 3.2 Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Global Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <div
            key={hub.code}
            className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-xs hover:border-blue-500/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {hub.code}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                  HUB
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {hub.status}
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              {hub.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{hub.region}</p>
            <div className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
              {hub.type}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Operational Load:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{hub.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <a
          href={ERP_URL}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
        >
          <Image src="/logo-64.png" alt="Logo" width={16} height={16} className="brightness-200" />
          <span>Inspect Active Terminal Telemetry in ERP →</span>
        </a>
      </div>
    </div>
  );
}
