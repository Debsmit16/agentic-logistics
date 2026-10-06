import { getPublicLocale } from "@/lib/i18n/public-locale";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const locale = await getPublicLocale();
  return (
    <I18nProvider locale={locale}>
      <LoginClient />
    </I18nProvider>
  );
}
