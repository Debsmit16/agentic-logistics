import { AppModule, DispatchStatus } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ScannerClient } from "./scanner-client";

export const metadata = {
  title: "Hub Barcode Scanner Station | Agentic Logistics",
  description:
    "Industrial warehouse barcode scanning station for high-speed parcel inwarding, runsheet staging, and 100x150mm thermal label printing.",
};

export default async function HubScannerPage() {
  await requirePermission(AppModule.ORDERS, "canRead");

  const trips = await prisma.dispatchTrip.findMany({
    where: {
      status: {
        in: [DispatchStatus.DRAFT, DispatchStatus.DISPATCHED],
      },
    },
    select: {
      id: true,
      tripNumber: true,
      vehicleNumber: true,
      driverName: true,
      status: true,
      type: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return withAppLayout(<ScannerClient initialTrips={trips} />);
}

