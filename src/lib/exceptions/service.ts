import { prisma } from "@/lib/db";
import { ExceptionStatus } from "@prisma/client";

export async function openException(input: {
  parcelId?: string;
  code: string;
  title: string;
  description?: string;
}) {
  return prisma.exception.create({
    data: {
      parcelId: input.parcelId,
      code: input.code,
      title: input.title,
      description: input.description,
      status: ExceptionStatus.OPEN,
    },
  });
}

export async function resolveException(id: string) {
  return prisma.exception.update({
    where: { id },
    data: { status: ExceptionStatus.RESOLVED, resolvedAt: new Date() },
  });
}

export async function listExceptions(status?: ExceptionStatus) {
  return prisma.exception.findMany({
    where: status ? { status } : undefined,
    include: {
      parcel: { select: { internalId: true, partnerAwb: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
