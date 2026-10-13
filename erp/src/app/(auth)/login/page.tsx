"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconShield,
  IconBox,
  IconTruck,
  IconActivity,
} from "@/components/icons/nav-icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Network or server connection failed. Please ensure the ERP server is accessible.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex h-screen max-h-screen w-screen flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors select-none">

      {/* ─── Ambient Background with Architectural Logistics Image ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Architectural Logistics Backdrop with High Brand Visibility */}
        <div className="absolute inset-0 opacity-70 dark:opacity-40 transition-opacity duration-300">
          <Image
            src="/agentic-enterprise-hero.jpg"
            alt="Agentic Enterprise Logistics Facility"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Ambient Gradient Scrim - clear center so the Agentic Enterprise facade & 3D globe shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/75 via-slate-50/20 to-slate-50/80 dark:from-[#070b14]/85 dark:via-[#070b14]/30 dark:to-[#070b14]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/70 via-transparent to-slate-50/30 dark:from-[#070b14]/70 dark:via-transparent dark:to-[#070b14]/30" />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/[0.08] dark:bg-blue-600/[0.12] blur-[140px]" />
      </div>

      {/* ─── 1. Header (Full Width) ─── */}
      <header className="relative z-30 flex items-center justify-between px-7 py-4.5 sm:px-10 lg:px-12 shrink-0 border-b border-slate-200/50 dark:border-white/[0.04] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-md">
            <Image
              src="/logo-128.png"
              alt="Agentic Logistics"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Agentic Logistics
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              ERP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Online</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ─── 2. Main Stage: Interactive 3D Globe & High-Impact Typography (Left) + Perfectly Blended Auth Card (Right) ─── */}
      <main className="relative z-20 flex flex-1 items-center justify-between px-7 sm:px-10 lg:px-12 py-3 min-h-0 overflow-hidden">

        {/* ─── LEFT: High-Impact Typography & Action Badges with Text Shadow Depth ─── */}
        <div className="relative hidden lg:flex flex-col justify-center h-full py-2 max-w-md xl:max-w-lg shrink-0 pointer-events-auto space-y-6 z-20">
          <div className="relative">
            {/* Subtle soft ambient aura behind text for clean elevation */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-white/50 dark:bg-slate-950/40 blur-2xl opacity-80" />

            {/* Display Typography with Elegant Text Shadow */}
            <h1 className="font-display text-4xl xl:text-5xl 2xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.06] drop-shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              Global Freight <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
                Orchestration.
              </span>
            </h1>

            {/* Subtext with soft shadow for crisp readability */}
            <p className="mt-4 text-xs xl:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Autonomous dispatch telemetry, automated parcel sorting, and real-time reconciliation across 42 global distribution hubs.
            </p>

            {/* 4 Feature Pills with real elevation shadows */}
            <div className="mt-6 grid grid-cols-4 gap-2.5">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 p-2.5 text-center shadow-[0_8px_20px_-3px_rgba(15,23,42,0.1),0_2px_6px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:-translate-y-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1">
                  <IconBox className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">Live Tracking</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 p-2.5 text-center shadow-[0_8px_20px_-3px_rgba(15,23,42,0.1),0_2px_6px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:-translate-y-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-1">
                  <IconActivity className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">AI Optim</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 p-2.5 text-center shadow-[0_8px_20px_-3px_rgba(15,23,42,0.1),0_2px_6px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:-translate-y-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
                  <IconShield className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">Secure Ops</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 p-2.5 text-center shadow-[0_8px_20px_-3px_rgba(15,23,42,0.1),0_2px_6px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:-translate-y-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-1">
                  <IconTruck className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">Multi-Modal</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CENTER/STAGE: Completely Open Cinematic Perspective ─── */}
        <div className="flex-1 pointer-events-none" />

        {/* ─── RIGHT: The Perfectly Blended Enterprise Auth Card with Deep Ambient Shadow ─── */}
        <div className="w-full max-w-[385px] mx-auto lg:mx-0 shrink-0">
          <div className="rounded-3xl border border-white/90 dark:border-white/[0.08] bg-white/85 dark:bg-slate-900/70 p-8 sm:p-9 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.18),0_12px_24px_-8px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.7)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),0_15px_30px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl transition-all">

            {/* Header */}
            <div className="text-center">
              <div className="relative mx-auto mb-3.5 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/15 dark:bg-blue-500/25 blur-lg" />
                <Image
                  src="/logo-128.png"
                  alt="Agentic Logistics Emblem"
                  width={52}
                  height={52}
                  className="relative z-10 object-contain drop-shadow-sm transition-transform hover:scale-105"
                  priority
                />
              </div>

              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sign in to your logistics console
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4.5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
                <span className="shrink-0 font-bold">✕</span>
                <span className="flex-1 leading-snug">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Work Email
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                    <IconMail className="h-4 w-4" />
                  </span>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="superadmin@plexierp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/40 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                    <IconLock className="h-4 w-4" />
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/40 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 accent-blue-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember device</span>
                </label>

                <span
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
                  title="Contact IT administration for password recovery"
                >
                  Forgot password?
                </span>
              </div>

              {/* Primary Action Button */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0f172a] hover:bg-[#1e293b] dark:bg-blue-600 dark:hover:bg-blue-500 py-2.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Signing in…</span>
                    </span>
                  ) : (
                    <span>Sign In to Console →</span>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Trust Note */}
            <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 dark:border-white/[0.06] pt-3.5 text-[11px] text-slate-400 dark:text-slate-500">
              <IconShield className="h-3.5 w-3.5 text-blue-500/80" />
              <span>Zero-Trust RBAC · 256-bit TLS Encrypted</span>
            </div>
          </div>
        </div>
      </main>

      {/* ─── 3. Footer (Full Width) ─── */}
      <footer className="relative z-30 flex flex-col sm:flex-row items-center justify-between gap-2 px-7 py-3.5 sm:px-10 lg:px-12 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 border-t border-slate-200/50 dark:border-white/[0.04] backdrop-blur-md">
        <p>© 2026 Agentic Logistics Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">Security</span>
          <span className="font-mono text-slate-400/80 dark:text-slate-600">v2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
