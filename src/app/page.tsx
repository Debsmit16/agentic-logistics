import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/permissions";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getPublicLocale } from "@/lib/i18n/public-locale";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect(ROLE_HOME[user.role] ?? "/dashboard");
  }

  const locale = await getPublicLocale();

  return (
    <I18nProvider locale={locale}>
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 p-6">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher current={locale} />
        </div>
        <div className="flex flex-col items-center text-center">
          <BrandLogo size="hero" showWordmark href="/" />
          <p className="mt-6 text-lg text-gray-600">{t(locale, "appTagline")}</p>
        </div>
        <Link
          href="/login"
          className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 text-center text-lg font-semibold text-white shadow-md"
        >
          {t(locale, "login")}
        </Link>
        <Link
          href="/track"
          className="w-full rounded-xl border border-gray-300 bg-white px-6 py-4 text-center text-lg font-semibold"
        >
          {t(locale, "track")}
        </Link>
      </main>
    </I18nProvider>
  );
}
