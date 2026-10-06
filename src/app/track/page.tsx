import { getPublicLocale } from "@/lib/i18n/public-locale";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import TrackClient from "./track-client";

export default async function TrackPage() {
  const locale = await getPublicLocale();
  return (
    <I18nProvider locale={locale}>
      <TrackClient />
    </I18nProvider>
  );
}
