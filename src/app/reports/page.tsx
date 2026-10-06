import Link from "next/link";
import { requirePageUser, withAppShell, getPageLocale } from "@/lib/auth/page-auth";
import ReportsAgingClient from "./reports-aging-client";
import { t } from "@/lib/i18n";

export default async function ReportsPage() {
  await requirePageUser();
  const locale = await getPageLocale();
  return withAppShell(
    <>
      <h1 className="text-2xl font-bold">{t(locale, "reportsTitle")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t(locale, "agingSubtitle")}</p>
      <div className="mt-4 flex flex-col gap-3">
        <Link
          href="/api/reports/parcels"
          className="inline-block w-fit rounded-xl bg-teal-700 px-5 py-3 text-white"
        >
          {t(locale, "downloadCsv")}
        </Link>
      </div>
      <ReportsAgingClient />
    </>,
  );
}
