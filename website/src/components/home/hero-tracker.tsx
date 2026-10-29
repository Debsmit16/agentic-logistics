"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroTracker() {
  const router = useRouter();
  const [awb, setAwb] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = awb.trim().toUpperCase();
    if (!clean) return;
    router.push(`/track?awb=${encodeURIComponent(clean)}`);
  }

  function handleQuickSelect(sampleCode: string) {
    router.push(`/track?awb=${encodeURIComponent(sampleCode)}`);
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-300/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1222]/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl max-w-xl">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Consignment Tracking
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          Real-Time GPS & e-POD
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            value={awb}
            onChange={(e) => setAwb(e.target.value)}
            placeholder="Enter AWB # (e.g. AWB-699902477)"
            className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase tracking-wider transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!awb.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
        >
          <span>Track</span>
          <span className="text-[10px]">→</span>
        </button>
      </form>

      {/* Quick click demo pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-400">Quick Test:</span>
        <button
          type="button"
          onClick={() => handleQuickSelect("AWB-699902477")}
          className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-600 dark:text-blue-300 hover:text-blue-400 transition-colors"
        >
          AWB-699902477 (Delivered)
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect("AWB-815606218")}
          className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-600 dark:text-blue-300 hover:text-blue-400 transition-colors"
        >
          AWB-815606218 (Rescheduled)
        </button>
      </div>
    </div>
  );
}

