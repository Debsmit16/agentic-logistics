import { prisma } from "@/lib/db";
import { appendParcelEvent, writeAuditLog } from "@/lib/audit";
import { assertTransition } from "@/lib/parcels/status-transitions";
import {
  ParcelStatus,
  PaymentType,
  type Prisma,
} from "@prisma/client";

async function nextInternalId(): Promise<string> {
  const count = await prisma.parcel.count();
  return `PAR-${String(count + 1).padStart(6, "0")}`;
}

export async function createParcel(
  data: {
    partnerId: string;
    partnerAwb: string;
    receiverName: string;
    receiverPhone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    paymentType?: PaymentType;
    codAmount?: number;
    senderName?: string;
    senderPhone?: string;
    warehouseId?: string;
    barcode?: string;
  },
  actorId: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const internalId = await nextInternalId();

    let customerId: string | undefined;
    const existingCustomer = await tx.customer.findFirst({
      where: { phone: data.receiverPhone },
    });
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const created = await tx.customer.create({
        data: {
          name: data.receiverName,
          phone: data.receiverPhone,
        },
      });
      customerId = created.id;
    }

    const parcel = await tx.parcel.create({
      data: {
        internalId,
        partnerId: data.partnerId,
        partnerAwb: data.partnerAwb,
        barcode: data.barcode ?? data.partnerAwb,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        paymentType: data.paymentType ?? PaymentType.PREPAID,
        codAmount: data.codAmount ?? 0,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        warehouseId: data.warehouseId,
        customerId,
        status: ParcelStatus.EXPECTED,
      },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId: parcel.id,
        eventType: "PARCEL_CREATED",
        status: ParcelStatus.EXPECTED,
        message: "Shipment record created",
        actorId: actorId ?? null,
      },
    });

    return parcel;
  });
}

async function transitionParcel(
  parcelId: string,
  to: ParcelStatus,
  actorId: string,
  eventType: string,
  message: string,
  extra?: Prisma.ParcelUpdateInput,
) {
  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    assertTransition(parcel.status, to);

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: { status: to, ...extra },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType,
        status: to,
        message,
        actorId: actorId ?? null,
      },
    });

    return updated;
  });
}

export async function receiveParcel(parcelId: string, actorId: string) {
  const result = await transitionParcel(
    parcelId,
    ParcelStatus.RECEIVED,
    actorId,
    "PARCEL_RECEIVED",
    "Parcel received at warehouse",
  );
  await writeAuditLog({
    actorId,
    action: "parcel.receive",
    entityType: "Parcel",
    entityId: parcelId,
    after: { status: ParcelStatus.RECEIVED },
  });
  return result;
}

export async function weighParcel(
  parcelId: string,
  weightKg: number,
  actorId: string,
) {
  if (weightKg <= 0) throw new Error("Weight must be greater than zero");

  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    assertTransition(parcel.status, ParcelStatus.WEIGHED);

    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        status: ParcelStatus.WEIGHED,
        weightKg,
        chargeableWeightKg: weightKg,
      },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "WEIGHT_RECORDED",
        status: ParcelStatus.WEIGHED,
        message: `Weight recorded: ${weightKg} KG`,
        actorId: actorId ?? null,
        metadata: { weightKg },
      },
    });

    return updated;
  });
}

export async function storeParcel(
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

    await tx.parcelLocationHistory.create({
      data: {
        parcelId,
        shelfId,
        locationLabel: label,
        actorId: actorId ?? null,
      },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "STORED",
        status: ParcelStatus.STORED,
        message: `Stored at ${label}`,
        actorId: actorId ?? null,
        metadata: { shelfId, locationLabel: label },
      },
    });

    return updated;
  });
}

export async function sortParcel(parcelId: string, actorId: string) {
  return transitionParcel(
    parcelId,
    ParcelStatus.SORTED,
    actorId,
    "SORTED",
    "Parcel sorted for dispatch",
  );
}

export async function markReadyForDispatch(parcelId: string, actorId: string) {
  return transitionParcel(
    parcelId,
    ParcelStatus.READY_FOR_DISPATCH,
    actorId,
    "READY_FOR_DISPATCH",
    "Ready for delivery batch",
  );
}

export async function findParcelByScan(query: string) {
  return prisma.parcel.findFirst({
    where: {
      OR: [
        { internalId: query },
        { partnerAwb: query },
        { barcode: query },
      ],
    },
    include: {
      partner: true,
      shelf: { include: { rack: { include: { zone: true } } } },
      events: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export { appendParcelEvent };
