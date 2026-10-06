import { ParcelStatus } from "@prisma/client";

const ALLOWED: Partial<Record<ParcelStatus, ParcelStatus[]>> = {
  EXPECTED: [ParcelStatus.RECEIVED, ParcelStatus.CANCELLED],
  RECEIVED: [ParcelStatus.WEIGHED, ParcelStatus.DAMAGED, ParcelStatus.MISSING],
  WEIGHED: [ParcelStatus.STORED],
  STORED: [ParcelStatus.SORTED, ParcelStatus.RETURN_TO_WAREHOUSE],
  SORTED: [ParcelStatus.READY_FOR_DISPATCH],
  READY_FOR_DISPATCH: [ParcelStatus.ASSIGNED],
  ASSIGNED: [ParcelStatus.OUT_FOR_DELIVERY],
  OUT_FOR_DELIVERY: [
    ParcelStatus.DELIVERED,
    ParcelStatus.DELIVERY_FAILED,
  ],
  DELIVERY_FAILED: [
    ParcelStatus.REATTEMPT_SCHEDULED,
    ParcelStatus.RETURN_TO_WAREHOUSE,
  ],
  REATTEMPT_SCHEDULED: [ParcelStatus.ASSIGNED, ParcelStatus.READY_FOR_DISPATCH],
  RETURN_TO_WAREHOUSE: [
    ParcelStatus.STORED,
    ParcelStatus.RETURNED_TO_PARTNER,
  ],
};

export function canTransition(from: ParcelStatus, to: ParcelStatus): boolean {
  if (from === to) return false;
  const next = ALLOWED[from];
  return next?.includes(to) ?? false;
}

export function assertTransition(from: ParcelStatus, to: ParcelStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid parcel status change: ${from} → ${to}`);
  }
}
