import { prisma } from "@/lib/db";
import { assertTransition } from "@/lib/parcels/status-transitions";
import { ParcelStatus } from "@prisma/client";

export async function moveParcel(
  parcelId: string,
  shelfId: string,
  actorId: string,
) {
  const shelf = await prisma.warehouseShelf.findFirst({
    where: { id: shelfId, isActive: true },
    include: { rack: { include: { zone: true } } },
  });
  if (!shelf) throw new Error("The warehouse location could not be found.");

  const label = `${shelf.rack.zone.code}-${shelf.rack.code}-${shelf.code}`;

  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    if (
      parcel.status !== ParcelStatus.STORED &&
      parcel.status !== ParcelStatus.SORTED
    ) {
      throw new Error("Only stored parcels can be moved.");
    }

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        shelfId,
        warehouseId: shelf.rack.zone.warehouseId,
      },
    });

    await tx.parcelLocationHistory.create({
      data: { parcelId, shelfId, locationLabel: label, actorId },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "MOVED",
        status: parcel.status,
        message: `Moved to ${label}`,
        actorId,
        metadata: { shelfId, locationLabel: label },
      },
    });

    return updated;
  });
}

export async function scheduleReattempt(parcelId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    assertTransition(parcel.status, ParcelStatus.REATTEMPT_SCHEDULED);

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: { status: ParcelStatus.REATTEMPT_SCHEDULED },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "REATTEMPT_SCHEDULED",
        status: ParcelStatus.REATTEMPT_SCHEDULED,
        message: "Reattempt scheduled",
        actorId,
      },
    });

    return updated;
  });
}

export async function markReturnToWarehouse(parcelId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    assertTransition(parcel.status, ParcelStatus.RETURN_TO_WAREHOUSE);

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        status: ParcelStatus.RETURN_TO_WAREHOUSE,
        assignedDeliveryBoyId: null,
        deliveryBatchId: null,
      },
    });

    await tx.deliveryAssignment.updateMany({
      where: { parcelId, isActive: true },
      data: { isActive: false, unassignedAt: new Date() },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "RETURN_TO_WAREHOUSE",
        status: ParcelStatus.RETURN_TO_WAREHOUSE,
        message: "Returned to warehouse",
        actorId,
      },
    });

    return updated;
  });
}

export async function receiveReturnAtWarehouse(
  parcelId: string,
  shelfId: string,
  actorId: string,
) {
  const shelf = await prisma.warehouseShelf.findFirst({
    where: { id: shelfId, isActive: true },
    include: { rack: { include: { zone: true } } },
  });
  if (!shelf) throw new Error("The warehouse location could not be found.");
  const label = `${shelf.rack.zone.code}-${shelf.rack.code}-${shelf.code}`;

  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    assertTransition(parcel.status, ParcelStatus.STORED);

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        status: ParcelStatus.STORED,
        shelfId,
        warehouseId: shelf.rack.zone.warehouseId,
      },
    });

    await tx.return.create({
      data: {
        parcelId,
        reason: "Received back at warehouse",
        actorId,
      },
    });

    await tx.parcelLocationHistory.create({
      data: { parcelId, shelfId, locationLabel: label, actorId },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "RETURN_RECEIVED",
        status: ParcelStatus.STORED,
        message: `Return stored at ${label}`,
        actorId,
      },
    });

    return updated;
  });
}

export async function returnToPartner(parcelId: string, actorId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    assertTransition(parcel.status, ParcelStatus.RETURNED_TO_PARTNER);

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: { status: ParcelStatus.RETURNED_TO_PARTNER, shelfId: null },
    });

    await tx.return.create({
      data: { parcelId, reason, actorId },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "RETURNED_TO_PARTNER",
        status: ParcelStatus.RETURNED_TO_PARTNER,
        message: reason,
        actorId,
      },
    });

    return updated;
  });
}
