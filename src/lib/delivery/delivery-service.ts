import { prisma } from "@/lib/db";
import { assertTransition } from "@/lib/parcels/status-transitions";
import { generateOtp, hashOtp } from "@/lib/auth/crypto";
import { sendDeliveryOtpMessage } from "@/lib/sms";
import { DEFAULT_POD, getSystemConfig } from "@/lib/config/system-config";
import { openException } from "@/lib/exceptions/service";
import { notifyRoles, notifyUser } from "@/lib/notifications/service";
import {
  SystemRole,
  DeliveryAttemptStatus,
  DeliveryBatchStatus,
  ParcelStatus,
  CodTransactionType,
  PaymentType,
} from "@prisma/client";

async function nextBatchCode(): Promise<string> {
  const count = await prisma.deliveryBatch.count();
  return `BATCH-${String(count + 1).padStart(5, "0")}`;
}

export async function createDeliveryBatch(
  warehouseId: string,
  parcelIds: string[],
  actorId: string,
) {
  if (parcelIds.length === 0) throw new Error("Select at least one parcel");

  return prisma.$transaction(async (tx) => {
    const batchCode = await nextBatchCode();
    const batch = await tx.deliveryBatch.create({
      data: {
        batchCode,
        warehouseId,
        status: DeliveryBatchStatus.DRAFT,
        createdById: actorId,
      },
    });

    for (const parcelId of parcelIds) {
      const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
      if (
        parcel.status !== ParcelStatus.SORTED &&
        parcel.status !== ParcelStatus.READY_FOR_DISPATCH &&
        parcel.status !== ParcelStatus.REATTEMPT_SCHEDULED
      ) {
        throw new Error(`Parcel ${parcel.internalId} is not ready for dispatch`);
      }
      await tx.parcel.update({
        where: { id: parcelId },
        data: {
          deliveryBatchId: batch.id,
          status: ParcelStatus.READY_FOR_DISPATCH,
        },
      });
    }

    await tx.deliveryBatch.update({
      where: { id: batch.id },
      data: { status: DeliveryBatchStatus.READY },
    });

    return batch;
  });
}

export async function assignParcelToDeliveryBoy(input: {
  batchId: string;
  parcelId: string;
  deliveryBoyId: string;
  actorId: string;
}) {
  const assignment = await prisma.$transaction(async (tx) => {
    const active = await tx.deliveryAssignment.findFirst({
      where: { parcelId: input.parcelId, isActive: true },
    });
    if (active) {
      throw new Error("This parcel is assigned to another delivery boy.");
    }

    const assignment = await tx.deliveryAssignment.create({
      data: {
        batchId: input.batchId,
        parcelId: input.parcelId,
        deliveryBoyId: input.deliveryBoyId,
      },
    });

    await tx.parcel.update({
      where: { id: input.parcelId },
      data: {
        status: ParcelStatus.ASSIGNED,
        assignedDeliveryBoyId: input.deliveryBoyId,
      },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId: input.parcelId,
        eventType: "ASSIGNED",
        status: ParcelStatus.ASSIGNED,
        message: "Assigned to delivery",
        actorId: input.actorId,
        metadata: { deliveryBoyId: input.deliveryBoyId },
      },
    });

    return assignment;
  });

  await notifyUser({
    userId: input.deliveryBoyId,
    title: "New delivery assigned",
    body: "You have a new parcel to deliver.",
    metadata: { parcelId: input.parcelId },
  });

  return assignment;
}

export async function startOutForDelivery(
  parcelId: string,
  deliveryBoyId: string,
) {
  const attempt = await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({ where: { id: parcelId } });
    if (parcel.assignedDeliveryBoyId !== deliveryBoyId) {
      throw new Error("This parcel is assigned to another delivery boy.");
    }
    assertTransition(parcel.status, ParcelStatus.OUT_FOR_DELIVERY);

    const assignment = await tx.deliveryAssignment.findFirstOrThrow({
      where: { parcelId, deliveryBoyId, isActive: true },
    });

    const attemptNumber =
      (await tx.deliveryAttempt.count({ where: { parcelId } })) + 1;

    const attempt = await tx.deliveryAttempt.create({
      data: {
        assignmentId: assignment.id,
        parcelId,
        attemptNumber,
        status: DeliveryAttemptStatus.OUT_FOR_DELIVERY,
        startedAt: new Date(),
      },
    });

    await tx.parcel.update({
      where: { id: parcelId },
      data: { status: ParcelStatus.OUT_FOR_DELIVERY },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId,
        eventType: "OUT_FOR_DELIVERY",
        status: ParcelStatus.OUT_FOR_DELIVERY,
        message: "Out for delivery",
        actorId: deliveryBoyId,
      },
    });

    return attempt;
  });

  await notifyRoles(
    [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.DELIVERY_MANAGER],
    {
    title: "Out for delivery",
    body: "A parcel is out for delivery.",
    metadata: { parcelId },
  });

  return attempt;
}

export async function sendDeliveryOtp(parcelId: string, deliveryBoyId: string) {
  const parcel = await prisma.parcel.findUniqueOrThrow({ where: { id: parcelId } });
  if (parcel.assignedDeliveryBoyId !== deliveryBoyId) {
    throw new Error("This parcel is assigned to another delivery boy.");
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.deliveryOtp.create({
    data: {
      parcelId,
      phone: parcel.receiverPhone,
      otpHash: hashOtp(otp),
      expiresAt,
    },
  });

  const sms = await sendDeliveryOtpMessage(parcel.receiverPhone, otp);

  return { expiresAt, devOtp: sms.devOtp };
}

export async function verifyDeliveryOtp(
  parcelId: string,
  otp: string,
  deliveryBoyId: string,
) {
  const record = await prisma.deliveryOtp.findFirst({
    where: { parcelId, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt < new Date()) {
    throw new Error("OTP expired or not found.");
  }
  if (record.otpHash !== hashOtp(otp)) {
    throw new Error("Incorrect OTP.");
  }

  await prisma.deliveryOtp.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() },
  });

  const attempt = await prisma.deliveryAttempt.findFirst({
    where: {
      parcelId,
      status: DeliveryAttemptStatus.OUT_FOR_DELIVERY,
      assignment: { deliveryBoyId, isActive: true },
    },
    orderBy: { createdAt: "desc" },
  });

  if (attempt) {
    await prisma.deliveryAttempt.update({
      where: { id: attempt.id },
      data: { otpVerified: true },
    });
  }

  return { verified: true };
}

export async function completeDelivery(input: {
  parcelId: string;
  deliveryBoyId: string;
  codCollected?: number;
  codPaymentMode?: string;
  codVarianceReason?: string;
  photoBase64?: string;
  signatureBase64?: string;
  recipientName?: string;
  latitude?: number;
  longitude?: number;
}) {
  const pod = await getSystemConfig("pod.requirements", DEFAULT_POD);

  const result = await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({
      where: { id: input.parcelId },
    });
    if (parcel.status === ParcelStatus.DELIVERED) {
      throw new Error("This parcel has already been delivered.");
    }
    assertTransition(parcel.status, ParcelStatus.DELIVERED);

    const attempt = await tx.deliveryAttempt.findFirstOrThrow({
      where: {
        parcelId: input.parcelId,
        status: DeliveryAttemptStatus.OUT_FOR_DELIVERY,
        assignment: { deliveryBoyId: input.deliveryBoyId, isActive: true },
      },
      orderBy: { createdAt: "desc" },
    });

    if (pod.requireOtp && !attempt.otpVerified) {
      throw new Error("Verify OTP before completing delivery.");
    }
    if (pod.requirePhoto && !input.photoBase64) {
      throw new Error("Delivery photo is required.");
    }
    if (pod.requireSignature && !input.signatureBase64) {
      throw new Error("Customer signature is required.");
    }
    if (pod.requireGps && (input.latitude == null || input.longitude == null)) {
      throw new Error("GPS location is required. Capture location before completing delivery.");
    }

    const codAmount =
      parcel.paymentType === PaymentType.COD
        ? Number(input.codCollected ?? parcel.codAmount)
        : 0;

    if (parcel.paymentType === PaymentType.COD && codAmount < 0) {
      throw new Error("COD cannot be negative.");
    }

    const expected = Number(parcel.codAmount);
    if (
      parcel.paymentType === PaymentType.COD &&
      Math.abs(codAmount - expected) > 0.01 &&
      !input.codVarianceReason
    ) {
      throw new Error("COD amount differs from expected. Enter a reason.");
    }

    await tx.deliveryAttempt.update({
      where: { id: attempt.id },
      data: {
        status: DeliveryAttemptStatus.DELIVERED,
        completedAt: new Date(),
        codCollected: codAmount,
        codPaymentMode: input.codPaymentMode,
        codVarianceReason: input.codVarianceReason,
        proof: {
          create: {
            photoBase64: input.photoBase64,
            signatureBase64: input.signatureBase64,
            recipientName: input.recipientName,
            latitude: input.latitude,
            longitude: input.longitude,
          },
        },
      },
    });

    await tx.parcel.update({
      where: { id: input.parcelId },
      data: { status: ParcelStatus.DELIVERED },
    });

    if (parcel.paymentType === PaymentType.COD) {
      await tx.codTransaction.create({
        data: {
          parcelId: input.parcelId,
          type: CodTransactionType.COLLECTED,
          amount: codAmount,
          recordedById: input.deliveryBoyId,
        },
      });
    }

    await tx.deliveryAssignment.update({
      where: { id: attempt.assignmentId },
      data: { isActive: false, unassignedAt: new Date() },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId: input.parcelId,
        eventType: "DELIVERED",
        status: ParcelStatus.DELIVERED,
        message: "Delivered",
        actorId: input.deliveryBoyId,
        metadata: { cod: codAmount },
      },
    });

    return { codAmount, expected, parcelInternalId: parcel.internalId };
  });

  if (
    result.codAmount !== undefined &&
    input.codVarianceReason &&
    Math.abs(result.codAmount - result.expected) > 0.01
  ) {
    await openException({
      parcelId: input.parcelId,
      code: "COD_VARIANCE",
      title: "COD amount mismatch",
      description: input.codVarianceReason,
    });
  }

  await notifyRoles(
    [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.ACCOUNTANT],
    {
    title: "Parcel delivered",
    body: `${result.parcelInternalId} marked delivered.`,
    metadata: { parcelId: input.parcelId, cod: result.codAmount },
  });

  try {
    const { generateTaxInvoiceForParcel } = await import("@/lib/finance/gst-invoice-service");
    await generateTaxInvoiceForParcel(input.parcelId);
  } catch (e) {
    console.error("Auto GST invoice:", e);
  }

  return { codAmount: result.codAmount };
}

export async function failDelivery(input: {
  parcelId: string;
  deliveryBoyId: string;
  failureReasonId: string;
  failureNote?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUniqueOrThrow({
      where: { id: input.parcelId },
    });
    assertTransition(parcel.status, ParcelStatus.DELIVERY_FAILED);

    const attempt = await tx.deliveryAttempt.findFirstOrThrow({
      where: {
        parcelId: input.parcelId,
        status: DeliveryAttemptStatus.OUT_FOR_DELIVERY,
        assignment: { deliveryBoyId: input.deliveryBoyId, isActive: true },
      },
      orderBy: { createdAt: "desc" },
    });

    await tx.deliveryAttempt.update({
      where: { id: attempt.id },
      data: {
        status: DeliveryAttemptStatus.FAILED,
        completedAt: new Date(),
        failureReasonId: input.failureReasonId,
        failureNote: input.failureNote,
      },
    });

    await tx.parcel.update({
      where: { id: input.parcelId },
      data: { status: ParcelStatus.DELIVERY_FAILED },
    });

    await tx.parcelEvent.create({
      data: {
        parcelId: input.parcelId,
        eventType: "DELIVERY_FAILED",
        status: ParcelStatus.DELIVERY_FAILED,
        message: input.failureNote ?? "Delivery failed",
        actorId: input.deliveryBoyId,
      },
    });
  });

  await notifyRoles(
    [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.DELIVERY_MANAGER],
    {
    title: "Delivery failed",
    body: input.failureNote ?? "A delivery attempt failed.",
    metadata: { parcelId: input.parcelId },
  });
}
