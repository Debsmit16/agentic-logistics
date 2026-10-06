import { prisma } from "@/lib/db";
import { SystemRole } from "@prisma/client";

export async function recordFleetPing(input: {
  userId: string;
  latitude: number;
  longitude: number;
  accuracyM?: number;
  speedKmh?: number;
  headingDeg?: number;
}) {
  return prisma.fleetGpsPing.create({
    data: {
      userId: input.userId,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracyM: input.accuracyM,
      speedKmh: input.speedKmh,
      headingDeg: input.headingDeg,
    },
  });
}

export async function listActiveFleetLocations(maxAgeMinutes = 15) {
  const since = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const deliveryRoles: SystemRole[] = [
    SystemRole.DELIVERY_BOY,
    SystemRole.DELIVERY_MANAGER,
  ];

  const users = await prisma.user.findMany({
    where: {
      role: { in: deliveryRoles },
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      displayName: true,
      phone: true,
      role: true,
      fleetGpsPings: {
        where: { recordedAt: { gte: since } },
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });

  return users
    .filter((u) => u.fleetGpsPings.length > 0)
    .map((u) => {
      const ping = u.fleetGpsPings[0]!;
      return {
        userId: u.id,
        displayName: u.displayName,
        phone: u.phone,
        role: u.role,
        latitude: Number(ping.latitude),
        longitude: Number(ping.longitude),
        accuracyM: ping.accuracyM,
        speedKmh: ping.speedKmh,
        recordedAt: ping.recordedAt.toISOString(),
      };
    });
}

export async function pruneOldFleetPings(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  await prisma.fleetGpsPing.deleteMany({ where: { recordedAt: { lt: cutoff } } });
}
