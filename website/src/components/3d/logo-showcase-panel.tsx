"use client";

import { LogoCube3D } from "./logo-cube-3d";
import Image from "next/image";
import { ERP_URL } from "@/lib/brand";

export function LogoShowcasePanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900 via-[#070e1e] to-slate-950 text-white p-8 lg:p-12 shadow-2xl">
      {/* Background architectural grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left text & technical specs */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 backdrop-blur-md mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">HARDWARE & TELEMETRY BEACON</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
            The Core Mark of Autonomous Freight.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Affixed to every connected container, autonomous tractor-trailer, and air-cargo ULD across our network. 
            The Agentic chevron emblem signifies certified sub-50ms cryptographic telemetry and verifiable chain-of-custody.
          </p>

          {/* Interactive Feature Pills */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="font-mono text-base font-bold text-blue-400">42 Hubs</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Continuous Sync</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="font-mono text-base font-bold text-emerald-400">AES-256</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Encrypted Beacon</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md col-span-2 sm:col-span-1">
              <div className="font-mono text-base font-bold text-sky-400">60 FPS</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Real-Time WebGL</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={ERP_URL}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              Sign In to Fleet Console →
            </a>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Image src="/logo-64.png" alt="Emblem" width={20} height={20} className="object-contain" />
              <span>Official Registered Mark</span>
            </div>
          </div>
        </div>

        {/* Right 3D Interactive Logo Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[380px] aspect-square rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-black/60 border border-blue-500/20 p-4 shadow-inner flex items-center justify-center">
            {/* Ambient blue aura */}
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
            
            <LogoCube3D className="w-full h-full" interactive={true} />
          </div>
          <span className="text-[11px] text-slate-400 mt-3 font-mono">
            Interactive WebGL 3D Model • Click & drag to inspect
          </span>
        </div>
      </div>
    </div>
  );
}
