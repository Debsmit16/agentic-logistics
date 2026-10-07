"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT, useLocale } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  Warehouse,
  IndianRupee,
  Key,
} from "lucide-react";

export default function LoginClient() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setIdentifier(emailParam);
      if (emailParam === "owner@agentic.local") {
        setPassword("changeme123");
      } else if (emailParam.includes("demo.agentic.local")) {
        setPassword("demo123456");
      }
    }
  }, [searchParams]);

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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col lg:flex-row antialiased selection:bg-sky-500 selection:text-white">
      {/* Left Hero Pane (Visible on lg+) */}
      <section className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo size="md" href="/" showWordmark={true} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher current={locale} />
          </div>
        </div>

        <div className="relative z-10 my-12 lg:my-0 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--accent-glow)] border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Tactile Logistics Platform</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight text-[var(--text-primary)]">
            Warehouse to last-mile, unified.
          </h2>

          <p className="text-[var(--text-secondary)] text-base leading-relaxed">
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
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="p-2 rounded-xl bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 shrink-0 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[var(--text-muted)] pt-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">Encrypted Session Authentication</span>
          </div>
          <Link href="/track" className="text-[var(--accent-primary)] font-bold hover:underline">
            Public Tracking →
          </Link>
        </div>
      </section>

      {/* Right Login Card Pane */}
      <main className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="skeuo-card w-full max-w-md p-8 sm:p-10 space-y-7 relative">
          {/* Top Specular Edge Line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {t("login")}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Authenticate with your system credentials to access your operational role.
            </p>
          </div>

          {error ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                {t("phoneEmail")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. owner@agentic.local"
                  className="skeuo-input w-full pl-10 pr-4 py-3 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t("password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--accent-primary)] font-semibold hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="skeuo-input w-full pl-10 pr-4 py-3 text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="skeuo-btn skeuo-btn-primary skeuo-btn-lg w-full font-bold shadow-md gap-2.5 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Chips with Tactile Skeuomorphic Buttons */}
          <div className="pt-6 border-t border-[var(--border-subtle)] space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Key className="w-3 h-3 text-amber-500" />
              <span>Instant One-Click Demo Personas:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials("owner@agentic.local", "changeme123")}
                className="skeuo-btn skeuo-btn-secondary px-3 py-2 text-left justify-between"
              >
                <span className="font-bold text-sky-500">Superadmin</span>
                <span className="text-[10px] text-[var(--text-muted)]">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("warehouse@demo.agentic.local", "demo123456")}
                className="skeuo-btn skeuo-btn-secondary px-3 py-2 text-left justify-between"
              >
                <span className="font-bold text-blue-500">Warehouse</span>
                <span className="text-[10px] text-[var(--text-muted)]">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("rider@demo.agentic.local", "demo123456")}
                className="skeuo-btn skeuo-btn-secondary px-3 py-2 text-left justify-between"
              >
                <span className="font-bold text-emerald-500">Rider</span>
                <span className="text-[10px] text-[var(--text-muted)]">Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("accounts@demo.agentic.local", "demo123456")}
                className="skeuo-btn skeuo-btn-secondary px-3 py-2 text-left justify-between"
              >
                <span className="font-bold text-purple-500">Finance</span>
                <span className="text-[10px] text-[var(--text-muted)]">Accountant</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
