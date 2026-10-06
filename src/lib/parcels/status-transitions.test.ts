import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/parcels/status-transitions";
import { ParcelStatus } from "@prisma/client";

describe("parcel status transitions", () => {
  it("allows happy path warehouse flow", () => {
    expect(canTransition(ParcelStatus.EXPECTED, ParcelStatus.RECEIVED)).toBe(true);
    expect(canTransition(ParcelStatus.RECEIVED, ParcelStatus.WEIGHED)).toBe(true);
    expect(canTransition(ParcelStatus.WEIGHED, ParcelStatus.STORED)).toBe(true);
    expect(canTransition(ParcelStatus.STORED, ParcelStatus.SORTED)).toBe(true);
  });

  it("rejects invalid jumps", () => {
    expect(canTransition(ParcelStatus.EXPECTED, ParcelStatus.DELIVERED)).toBe(false);
  });
});
