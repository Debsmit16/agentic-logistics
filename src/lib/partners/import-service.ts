import { prisma } from "@/lib/db";
import { createParcel } from "@/lib/parcels/parcel-service";
import { PaymentType } from "@prisma/client";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

export async function importParcelsFromCsv(
  partnerId: string,
  csvText: string,
  actorId: string,
  warehouseId?: string,
) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must include a header row and data.");

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const required = [
    "partnerawb",
    "receivername",
    "receiverphone",
    "addressline1",
    "city",
    "state",
    "pincode",
  ];
  for (const col of required) {
    if (idx(col) === -1) {
      throw new Error(`Missing CSV column: ${col}`);
    }
  }

  const created: string[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let r = 1; r < lines.length; r++) {
    const cols = parseCsvLine(lines[r]);
    try {
      const partnerAwb = cols[idx("partnerawb")];
      if (!partnerAwb) throw new Error("partnerAwb is required");

      const paymentRaw = idx("paymenttype") >= 0 ? cols[idx("paymenttype")]?.toUpperCase() : "PREPAID";
      const paymentType =
        paymentRaw === "COD" ? PaymentType.COD : PaymentType.PREPAID;
      const codAmount =
        idx("codamount") >= 0 ? Number(cols[idx("codamount")] || 0) : 0;

      const parcel = await createParcel(
        {
          partnerId,
          partnerAwb,
          receiverName: cols[idx("receivername")],
          receiverPhone: cols[idx("receiverphone")],
          addressLine1: cols[idx("addressline1")],
          addressLine2: idx("addressline2") >= 0 ? cols[idx("addressline2")] : undefined,
          city: cols[idx("city")],
          state: cols[idx("state")],
          pincode: cols[idx("pincode")],
          paymentType,
          codAmount,
          warehouseId,
          senderName: idx("sendername") >= 0 ? cols[idx("sendername")] : undefined,
          senderPhone: idx("senderphone") >= 0 ? cols[idx("senderphone")] : undefined,
        },
        actorId,
      );
      created.push(parcel.internalId);
    } catch (e) {
      errors.push({
        row: r + 1,
        message: e instanceof Error ? e.message : "Import failed",
      });
    }
  }

  return { created, errors };
}

export async function listParcels(filters: {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 25, 100);
  const where = {
    deletedAt: null as Date | null,
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.q
      ? {
          OR: [
            { internalId: { contains: filters.q, mode: "insensitive" as const } },
            { partnerAwb: { contains: filters.q, mode: "insensitive" as const } },
            { receiverPhone: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.parcel.findMany({
      where,
      include: { partner: { select: { code: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.parcel.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
