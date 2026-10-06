import Link from "next/link";
import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import { prisma } from "@/lib/db";
import { ParcelStatus } from "@prisma/client";

export default async function DashboardPage() {
  await requirePageUser();
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
      where: { status: { in: [ParcelStatus.DELIVERY_FAILED, ParcelStatus.REATTEMPT_SCHEDULED] } },
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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total parcels" value={total} />
        <Stat label="Received (now)" value={received} />
        <Stat label="Out for delivery" value={outForDelivery} />
        <Stat label="Delivered today" value={deliveredToday} />
        <Stat label="Failed / reattempt" value={failedOpen} />
        <Stat label="Aging (&gt;7d open)" value={aging} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <NavButton href="/warehouse">Warehouse</NavButton>
        <NavButton href="/parcels">Parcels</NavButton>
        <NavButton href="/delivery">Delivery</NavButton>
        <NavButton href="/delivery/failed">Failed deliveries</NavButton>
        <NavButton href="/finance">COD</NavButton>
        <NavButton href="/reports">Reports</NavButton>
        <NavButton href="/settings/warehouses">Setup warehouses</NavButton>
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
