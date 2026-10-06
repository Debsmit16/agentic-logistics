import { prisma } from "@/lib/db";
import { getSystemConfig, setSystemConfig } from "@/lib/config/system-config";
import { ParcelStatus } from "@prisma/client";

export type GstProfile = {
  legalName: string;
  gstin: string;
  address: string;
  stateCode: string;
  defaultFreightRatePerKg: number;
  gstRatePercent: number;
};

export const DEFAULT_GST: GstProfile = {
  legalName: "Agentic Logistics Pvt Ltd",
  gstin: "27AAAAA0000A1Z5",
  address: "Registered office address",
  stateCode: "27",
  defaultFreightRatePerKg: 12,
  gstRatePercent: 18,
};

const INDIAN_STATE_CODES: Record<string, string> = {
  maharashtra: "27",
  "west bengal": "19",
  karnataka: "29",
  delhi: "07",
  "uttar pradesh": "09",
  gujarat: "24",
  tamil: "33",
  telangana: "36",
};

export function stateCodeFromName(state: string): string {
  const key = state.trim().toLowerCase();
  for (const [name, code] of Object.entries(INDIAN_STATE_CODES)) {
    if (key.includes(name)) return code;
  }
  return "27";
}

export async function getGstProfile(): Promise<GstProfile> {
  return getSystemConfig("gst.profile", DEFAULT_GST);
}

export async function saveGstProfile(profile: GstProfile) {
  return setSystemConfig("gst.profile", profile);
}

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.taxInvoice.count({
    where: { invoiceNumber: { startsWith: `INV-${year}-` } },
  });
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function generateTaxInvoiceForParcel(parcelId: string) {
  const existing = await prisma.taxInvoice.findUnique({ where: { parcelId } });
  if (existing) return existing;

  const parcel = await prisma.parcel.findUniqueOrThrow({
    where: { id: parcelId },
    include: { partner: true },
  });

  if (parcel.status !== ParcelStatus.DELIVERED) {
    throw new Error("GST invoice can only be generated for delivered parcels.");
  }

  const profile = await getGstProfile();
  const weight = Number(parcel.chargeableWeightKg ?? parcel.weightKg ?? 1);
  const taxableAmount = Math.round(weight * profile.defaultFreightRatePerKg * 100) / 100;
  const buyerStateCode = stateCodeFromName(parcel.state);
  const isIntraState = buyerStateCode === profile.stateCode;
  const rate = profile.gstRatePercent / 100;
  const taxTotal = Math.round(taxableAmount * rate * 100) / 100;

  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isIntraState) {
    cgstRate = profile.gstRatePercent / 2;
    sgstRate = profile.gstRatePercent / 2;
    cgstAmount = taxTotal / 2;
    sgstAmount = taxTotal / 2;
  } else {
    igstRate = profile.gstRatePercent;
    igstAmount = taxTotal;
  }

  const totalAmount = taxableAmount + taxTotal;
  const buyerAddress = `${parcel.addressLine1}, ${parcel.city}, ${parcel.state} ${parcel.pincode}`;

  return prisma.taxInvoice.create({
    data: {
      invoiceNumber: await nextInvoiceNumber(),
      parcelId: parcel.id,
      partnerId: parcel.partnerId,
      sellerLegalName: profile.legalName,
      sellerGstin: profile.gstin,
      sellerAddress: profile.address,
      buyerName: parcel.receiverName,
      buyerAddress,
      buyerState: parcel.state,
      placeOfSupply: parcel.state,
      taxableAmount,
      cgstRate,
      sgstRate,
      igstRate,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
    },
  });
}

export async function listTaxInvoices(limit = 100) {
  return prisma.taxInvoice.findMany({
    orderBy: { issuedAt: "desc" },
    take: limit,
    include: { parcel: { select: { internalId: true } } },
  });
}

export async function getTaxInvoice(id: string) {
  return prisma.taxInvoice.findUnique({
    where: { id },
    include: { parcel: true, partner: true },
  });
}
