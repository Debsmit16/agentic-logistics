import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/permissions";
import { getPublicLocale } from "@/lib/i18n/public-locale";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { HomeClient } from "@/components/home/home-client";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect(ROLE_HOME[user.role] ?? "/dashboard");
  }

  const locale = await getPublicLocale();

  return (
    <I18nProvider locale={locale}>
      <HomeClient locale={locale} />
    </I18nProvider>
  );
}
