import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import { prisma } from "@/lib/db";
import { ParcelStatus } from "@prisma/client";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const user = await requirePageUser();
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
    <DashboardView
      role={user.role}
      stats={{
        total,
        received,
        outForDelivery,
        deliveredToday,
        failedOpen,
        aging,
      }}
    />,
  );
}
