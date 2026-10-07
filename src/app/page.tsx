import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/permissions";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getPublicLocale } from "@/lib/i18n/public-locale";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect(ROLE_HOME[user.role] ?? "/dashboard");
  }

  const locale = await getPublicLocale();

  return (
    <I18nProvider locale={locale}>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Right Controls */}
        <div className="absolute right-6 top-6 flex items-center gap-3 z-20">
          <ThemeToggle />
          <LanguageSwitcher current={locale} />
        </div>

        {/* Central Hero Card */}
        <div className="skeuo-card max-w-md w-full p-8 sm:p-10 flex flex-col items-center text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-glow)] border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Autonomous Logistics Stack</span>
          </div>

          <div className="flex flex-col items-center">
            <BrandLogo size="lg" showWordmark href="/" />
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
              {t(locale, "appTagline")}
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <Link
              href="/login"
              className="skeuo-btn skeuo-btn-primary w-full py-4 text-base font-bold shadow-md gap-2"
            >
              <span>{t(locale, "login")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/track"
              className="skeuo-btn skeuo-btn-secondary w-full py-3.5 text-sm font-bold gap-2"
            >
              <Search className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>{t(locale, "track")}</span>
            </Link>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] tracking-wide">
            Enterprise Grade · Multi-Carrier Routing · Neon PostgreSQL
          </p>
        </div>
      </main>
    </I18nProvider>
  );
}
