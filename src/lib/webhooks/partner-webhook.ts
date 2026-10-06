import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { createParcel } from "@/lib/parcels/parcel-service";
import { openException } from "@/lib/exceptions/service";
import { PaymentType, ParcelStatus } from "@prisma/client";

function verifySignature(
  secret: string | null | undefined,
  body: string,
  signature: string | null,
): boolean {
  if (!secret) return true;
  if (!signature) return false;
  const expected = createHash("sha256").update(`${secret}.${body}`).digest("hex");
  return expected === signature;
}

export async function handlePartnerWebhook(
  partnerId: string,
  rawBody: string,
  headers: { signature?: string | null; idempotencyKey?: string | null },
  payload: {
    eventType: string;
    partnerAwb?: string;
    idempotencyKey?: string;
    shipment?: Record<string, unknown>;
  },
) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { integrations: { where: { isActive: true }, take: 1 } },
  });
  if (!partner || !partner.isActive) {
    throw new Error("Partner not found.");
  }

  const secret = partner.integrations[0]?.webhookSecret ?? null;
  if (!verifySignature(secret, rawBody, headers.signature ?? null)) {
    throw new Error("Invalid webhook signature.");
  }

  const idempotencyKey =
    headers.idempotencyKey ?? payload.idempotencyKey ?? `${payload.eventType}-${payload.partnerAwb}`;

  if (idempotencyKey) {
    const existing = await prisma.partnerWebhookEvent.findUnique({
      where: { partnerId_idempotencyKey: { partnerId, idempotencyKey } },
    });
    if (existing?.processedAt) {
      return { duplicate: true, eventId: existing.id };
    }
  }

  const event = await prisma.partnerWebhookEvent.create({
    data: {
      partnerId,
      idempotencyKey: idempotencyKey ?? undefined,
      eventType: payload.eventType,
      payload: payload as object,
    },
  });

  try {
    if (payload.eventType === "SHIPMENT_CREATED" && payload.partnerAwb && payload.shipment) {
      const s = payload.shipment;
      await createParcel(
        {
          partnerId,
          partnerAwb: payload.partnerAwb,
          receiverName: String(s.receiverName ?? ""),
          receiverPhone: String(s.receiverPhone ?? ""),
          addressLine1: String(s.addressLine1 ?? ""),
          city: String(s.city ?? ""),
          state: String(s.state ?? ""),
          pincode: String(s.pincode ?? ""),
          paymentType:
            String(s.paymentType ?? "").toUpperCase() === "COD"
              ? PaymentType.COD
              : PaymentType.PREPAID,
          codAmount: Number(s.codAmount ?? 0),
        },
        null,
      );
    } else if (payload.eventType === "SHIPMENT_CANCELLED" && payload.partnerAwb) {
      const parcel = await prisma.parcel.findFirst({
        where: { partnerId, partnerAwb: payload.partnerAwb },
      });
      if (parcel && parcel.status !== ParcelStatus.DELIVERED) {
        await prisma.parcel.update({
          where: { id: parcel.id },
          data: { status: ParcelStatus.CANCELLED },
        });
      }
    }

    await prisma.partnerWebhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date() },
    });

    return { duplicate: false, eventId: event.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed";
    await prisma.partnerWebhookEvent.update({
      where: { id: event.id },
      data: { errorMessage: message },
    });
    await openException({
      code: "WEBHOOK_ERROR",
      title: "Partner webhook failed",
      description: message,
    });
    throw e;
  }
}
