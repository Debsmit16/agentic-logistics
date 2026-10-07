"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT, useLocale } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  Warehouse,
  IndianRupee,
} from "lucide-react";

export default function LoginClient() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) {
        setError(data.error ?? t("loginError"));
        return;
      }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError(t("loginError"));
    } finally {
      setLoading(false);
    }
  }

  function setDemoCredentials(email: string, pass: string) {
    setIdentifier(email);
    setPassword(pass);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Left Hero Pane (Visible on lg+) */}
      <section className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo size="md" href="/" showWordmark={true} />
          <LanguageSwitcher current={locale} />
        </div>

        <div className="relative z-10 my-12 lg:my-0 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Logistics Operating System</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Warehouse to last-mile, unified.
          </h2>

          <p className="text-slate-400 text-base leading-relaxed">
            {t("appTagline")}
          </p>

          <ul className="space-y-3.5 pt-2">
            {[
              { text: t("loginFeature1"), icon: Warehouse },
              { text: t("loginFeature2"), icon: Truck },
              { text: t("loginFeature3"), icon: IndianRupee },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>AES-256 encrypted session authentication</span>
          </div>
          <Link href="/track" className="text-cyan-400 hover:underline">
            Public Tracking →
          </Link>
        </div>
      </section>

      {/* Right Login Card Pane */}
      <main className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900/50">
        <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("login")}
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your system role credentials to access operational portals.
            </p>
          </div>

          {error ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-fadeIn">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t("phoneEmail")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. owner@agentic.local"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t("login")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Chips */}
          <div className="pt-6 border-t border-slate-800 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quick One-Click Demo Logins:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials("owner@agentic.local", "changeme123")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-cyan-400">Superadmin</span>
                <span className="text-[10px] text-slate-500">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("warehouse@demo.agentic.local", "demo123456")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-blue-400">Warehouse</span>
                <span className="text-[10px] text-slate-500">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("rider@demo.agentic.local", "demo123456")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-amber-400">Rider</span>
                <span className="text-[10px] text-slate-500">Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("accounts@demo.agentic.local", "demo123456")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span className="font-semibold text-purple-400">Finance</span>
                <span className="text-[10px] text-slate-500">Accountant</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
