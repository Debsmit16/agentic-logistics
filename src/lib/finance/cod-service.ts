import { prisma } from "@/lib/db";
import { CodTransactionType } from "@prisma/client";

export async function listCodLedger() {
  return prisma.codTransaction.findMany({
    include: {
      parcel: {
        select: {
          internalId: true,
          partnerAwb: true,
          receiverName: true,
          codAmount: true,
        },
      },
      recordedBy: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function createSettlement(input: {
  reference: string;
  partnerId?: string;
  transactionIds: string[];
  note?: string;
  actorId: string;
}) {
  if (input.transactionIds.length === 0) {
    throw new Error("Select at least one COD collection.");
  }

  return prisma.$transaction(async (tx) => {
    const txs = await tx.codTransaction.findMany({
      where: {
        id: { in: input.transactionIds },
        type: CodTransactionType.COLLECTED,
        settlementId: null,
      },
    });
    if (txs.length !== input.transactionIds.length) {
      throw new Error("Some collections are already settled or invalid.");
    }

    const totalAmount = txs.reduce((sum, t) => sum + Number(t.amount), 0);

    const settlement = await tx.settlement.create({
      data: {
        reference: input.reference,
        partnerId: input.partnerId ?? null,
        totalAmount,
        note: input.note,
      },
    });

    await tx.codTransaction.updateMany({
      where: { id: { in: input.transactionIds } },
      data: { settlementId: settlement.id },
    });

    for (const t of txs) {
      await tx.codTransaction.create({
        data: {
          parcelId: t.parcelId,
          type: CodTransactionType.SETTLED,
          amount: t.amount,
          recordedById: input.actorId,
          settlementId: settlement.id,
        },
      });
    }

    return settlement;
  });
}

export async function codSummary() {
  const [expected, collected, unsettled] = await Promise.all([
    prisma.parcel.aggregate({
      where: { paymentType: "COD", status: { not: "DELIVERED" } },
      _sum: { codAmount: true },
    }),
    prisma.codTransaction.aggregate({
      where: { type: CodTransactionType.COLLECTED },
      _sum: { amount: true },
    }),
    prisma.codTransaction.aggregate({
      where: { type: CodTransactionType.COLLECTED, settlementId: null },
      _sum: { amount: true },
    }),
  ]);

  return {
    expectedOpen: Number(expected._sum.codAmount ?? 0),
    collectedTotal: Number(collected._sum.amount ?? 0),
    unsettledCollected: Number(unsettled._sum.amount ?? 0),
  };
}
