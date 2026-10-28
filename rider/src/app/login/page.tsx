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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Subtle Ambient Light Gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[350px] w-[350px] rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-4 shadow-md">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>COURIER FIELD TELEMETRY</span>
            </div>

            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {APP_NAME}
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              Autonomous Last-Mile Run-Sheet & Digital e-POD Console
            </p>
          </div>
        </div>

        {/* Executive Light Card Form */}
        <div className="royal-card rounded-3xl p-6 shadow-xl border border-slate-200 bg-white">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-600">
                Driver Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <IconPhone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-3.5 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-600">
                Driver Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Sharma"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <IconTruck className="h-4 w-4" />
              <span>{loading ? "Authenticating..." : "Access Delivery Run-Sheet"}</span>
            </button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Active run-sheets assigned by your sorting facility load instantly upon authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
