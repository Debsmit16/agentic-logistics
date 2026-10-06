import Link from "next/link";
import { requirePageUser, withAppShell, getPageLocale } from "@/lib/auth/page-auth";
import { prisma } from "@/lib/db";
import { ParcelStatus } from "@prisma/client";
import { t } from "@/lib/i18n";

export default async function DashboardPage() {
  await requirePageUser();
  const locale = await getPageLocale();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [total, received, outForDelivery, deliveredToday, failedOpen, aging] =
    await Promise.all([
      prisma.parcel.count(),
      prisma.parcel.count({ where: { status: ParcelStatus.RECEIVED } }),
      prisma.parcel.count({ where: { status: ParcelStatus.OUT_FOR_DELIVERY } }),
      prisma.parcel.count({
        where: {
          status: ParcelStatus.DELIVERED,
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.parcel.count({
        where: {
          status: { in: [ParcelStatus.DELIVERY_FAILED, ParcelStatus.REATTEMPT_SCHEDULED] },
        },
      }),
      prisma.parcel.count({
        where: {
          status: { notIn: [ParcelStatus.DELIVERED, ParcelStatus.CANCELLED] },
          createdAt: { lt: cutoff },
        },
      }),
    ]);

  return withAppShell(
    <>
      <h1 className="text-2xl font-bold">{t(locale, "dashboard")}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={t(locale, "totalParcels")} value={total} />
        <Stat label={t(locale, "receivedNow")} value={received} />
        <Stat label={t(locale, "outForDelivery")} value={outForDelivery} />
        <Stat label={t(locale, "deliveredToday")} value={deliveredToday} />
        <Stat label={t(locale, "failedReattempt")} value={failedOpen} />
        <Stat label={t(locale, "agingOpen")} value={aging} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <NavButton href="/warehouse">{t(locale, "warehouse")}</NavButton>
        <NavButton href="/parcels">{t(locale, "navParcels")}</NavButton>
        <NavButton href="/delivery">{t(locale, "delivery")}</NavButton>
        <NavButton href="/delivery/failed">{t(locale, "failedDeliveries")}</NavButton>
        <NavButton href="/fleet">{t(locale, "navFleet")}</NavButton>
        <NavButton href="/finance">{t(locale, "navCod")}</NavButton>
        <NavButton href="/reports">{t(locale, "navReports")}</NavButton>
        <NavButton href="/settings/warehouses">{t(locale, "setupWarehouses")}</NavButton>
      </div>
    </>,
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function NavButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white">
      {children}
    </Link>
  );
}
