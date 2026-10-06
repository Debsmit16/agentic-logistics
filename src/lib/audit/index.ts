import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      before: input.before,
      after: input.after,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function appendParcelEvent(input: {
  parcelId: string;
  eventType: string;
  status?: import("@prisma/client").ParcelStatus;
  message?: string;
  metadata?: Prisma.InputJsonValue;
  actorId?: string | null;
}) {
  return prisma.parcelEvent.create({
    data: {
      parcelId: input.parcelId,
      eventType: input.eventType,
      status: input.status,
      message: input.message,
      metadata: input.metadata,
      actorId: input.actorId ?? null,
    },
  });
}
