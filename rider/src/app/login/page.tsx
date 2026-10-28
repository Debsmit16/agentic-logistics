"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { APP_NAME, LOGO } from "@/lib/brand";
import { IconPhone, IconTruck } from "@/components/icons";

export default function RiderLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || phone.trim().length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          driverName: driverName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Authentication failed.");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[#070b14] overflow-hidden">
      {/* Ambient Royal Blue Glow Backdrop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-3xl border border-white/[0.12] bg-gradient-to-b from-white/[0.08] to-transparent p-4 shadow-2xl backdrop-blur-xl">
            <Image
              src={LOGO.lg}
              alt="Agentic Emblem"
              width={54}
              height={54}
              className="object-contain"
              priority
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COURIER FIELD TELEMETRY</span>
            </div>

            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">
              {APP_NAME}
            </h1>
            <p className="mt-1 text-xs text-slate-400 font-normal">
              Autonomous Last-Mile Run-Sheet & Digital e-POD Console
            </p>
          </div>
        </div>

        {/* Executive Glass Card Form */}
        <div className="royal-card rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Driver Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <IconPhone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-3 pl-10 pr-3.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Driver Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Sharma"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-3 px-3.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3.5 font-display text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition active:scale-[0.98] disabled:opacity-50"
            >
              <IconTruck className="h-4 w-4" />
              <span>{loading ? "Authenticating..." : "Access Delivery Run-Sheet"}</span>
            </button>
          </form>

          <div className="mt-5 border-t border-white/[0.06] pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Active run-sheets assigned by your sorting facility load instantly upon authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
