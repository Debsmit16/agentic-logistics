import { Suspense } from "react";
import { TrackClient } from "./track-client";

export const metadata = {
  title: "Track Consignment | Agentic Logistics",
  description:
    "Real-time autonomous consignment tracking, milestone audit trail, live driver telemetry, and verified digital proof of delivery.",
};

function TrackFallback() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-[#0c1222] p-8 shadow-xl animate-pulse space-y-6">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-10 w-full max-w-xl bg-slate-800/80 rounded-2xl" />
          <div className="h-40 w-full bg-slate-800/40 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackFallback />}>
      <TrackClient />
    </Suspense>
  );
}

