import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { parseLocale } from "@/lib/i18n/locale";
import { ROLE_NAV } from "@/lib/i18n/nav";
import { t, type Locale } from "@/lib/i18n";

export async function withAppShell(children: React.ReactNode) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferredLang: true },
  });
  const locale: Locale = parseLocale(full?.preferredLang);
  const navItems = ROLE_NAV[user.role] ?? ROLE_NAV.OWNER ?? [];
  const links = navItems.map((item) => ({
    href: item.href,
    label: t(locale, item.key),
  }));

  return (
    <I18nProvider locale={locale}>
      <AppShell
        userName={user.displayName}
        role={user.role}
        preferredLang={locale}
        links={links}
      >
        {children}
      </AppShell>
    </I18nProvider>
  );
}

export async function requirePageUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function getPageLocale(): Promise<Locale> {
  const user = await getSessionUser();
  if (!user) return "en";
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferredLang: true },
  });
  return parseLocale(full?.preferredLang);
}
