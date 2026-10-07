/**
 * Idempotent demo data for manual QA. Safe to re-run.
 * Password for all @demo.agentic.local users: demo123456
 */
import { hashPassword } from "../src/lib/auth/crypto";
import { createParcel, receiveParcel, weighParcel, storeParcel, sortParcel } from "../src/lib/parcels/parcel-service";
import {
  assignParcelToDeliveryBoy,
  createDeliveryBatch,
  startOutForDelivery,
} from "../src/lib/delivery/delivery-service";
import { PaymentType, PrismaClient, SystemRole } from "@prisma/client";

const prisma = new PrismaClient({
  transactionOptions: { maxWait: 15000, timeout: 60000 },
});

const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? "demo123456";

const DEMO_USERS: {
  email: string;
  displayName: string;
  role: SystemRole;
}[] = [
  { email: "warehouse@demo.agentic.local", displayName: "Demo Warehouse Mgr", role: "WAREHOUSE_MANAGER" },
  { email: "staff@demo.agentic.local", displayName: "Demo Warehouse Staff", role: "WAREHOUSE_STAFF" },
  { email: "delivery.mgr@demo.agentic.local", displayName: "Demo Delivery Mgr", role: "DELIVERY_MANAGER" },
  { email: "rider@demo.agentic.local", displayName: "Demo Rider (Arjun)", role: "DELIVERY_BOY" },
  {
    email: "deliveryboy@demo.agentic.local",
    displayName: "Demo Delivery Boy (Vikram)",
    role: "DELIVERY_BOY",
  },
  { email: "accounts@demo.agentic.local", displayName: "Demo Accountant", role: "ACCOUNTANT" },
];

async function upsertDemoUser(
  email: string,
  displayName: string,
  role: SystemRole,
  warehouseId?: string,
) {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { email },
      data: { displayName, role, passwordHash, warehouseId, isActive: true, deletedAt: null },
    });
  }
  return prisma.user.create({
    data: {
      email,
      displayName,
      role,
      passwordHash,
      warehouseId,
    },
  });
}

async function ensureWarehouse() {
  let wh = await prisma.warehouse.findUnique({ where: { code: "DEMO-HQ" } });
  if (wh) return wh;

  wh = await prisma.warehouse.create({
    data: {
      code: "DEMO-HQ",
      name: "Demo Hub Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      address: "Demo Industrial Estate, Andheri",
      isActive: true,
    },
  });

  const zone = await prisma.warehouseZone.create({
    data: { warehouseId: wh.id, code: "A", name: "Zone A", isActive: true },
  });
  const rack = await prisma.warehouseRack.create({
    data: { zoneId: zone.id, code: "R1", name: "Rack 1", isActive: true },
  });
  await prisma.warehouseShelf.create({
    data: { rackId: rack.id, code: "S1", label: "A-R1-S1", isActive: true },
  });

  return wh;
}

async function getDemoShelf(warehouseId: string) {
  return prisma.warehouseShelf.findFirst({
    where: { rack: { zone: { warehouseId } }, code: "S1" },
  });
}

async function ensurePartner() {
  let p = await prisma.partner.findUnique({ where: { code: "DEMO" } });
  if (p) return p;
  return prisma.partner.create({
    data: { code: "DEMO", name: "Demo Partner Logistics", isActive: true },
  });
}

async function seedFleetPing(userId: string, latitude: number, longitude: number) {
  await prisma.fleetGpsPing.create({
    data: {
      userId,
      latitude,
      longitude,
      accuracyM: 15,
      speedKmh: 22,
      recordedAt: new Date(),
    },
  });
}

async function ensureOutForDelivery(
  parcelId: string,
  riderId: string,
  ownerId: string,
  warehouseId: string,
  shelfId: string,
) {
  let p = await prisma.parcel.findUniqueOrThrow({ where: { id: parcelId } });

  if (p.status === "EXPECTED") {
    await receiveParcel(p.id, ownerId);
    await weighParcel(p.id, 2, ownerId);
    await storeParcel(p.id, shelfId, ownerId);
    await sortParcel(p.id, ownerId);
    p = await prisma.parcel.findUniqueOrThrow({ where: { id: parcelId } });
  }

  if (p.status === "SORTED") {
    const batch = await createDeliveryBatch(warehouseId, [p.id], ownerId);
    await assignParcelToDeliveryBoy({
      batchId: batch.id,
      parcelId: p.id,
      deliveryBoyId: riderId,
      actorId: ownerId,
    });
    p = await prisma.parcel.findUniqueOrThrow({ where: { id: parcelId } });
  }

  if (p.status === "ASSIGNED" && p.assignedDeliveryBoyId === riderId) {
    await startOutForDelivery(p.id, riderId);
  }
}

type DemoParcelInput = Omit<
  Parameters<typeof createParcel>[0],
  "partnerId" | "partnerAwb" | "warehouseId"
>;

async function ensureParcel(
  partnerId: string,
  warehouseId: string,
  awb: string,
  data: DemoParcelInput,
  actorId: string,
) {
  const existing = await prisma.parcel.findFirst({
    where: { partnerId, partnerAwb: awb },
  });
  if (existing) return existing;

  return createParcel(
    {
      ...data,
      partnerId,
      partnerAwb: awb,
      warehouseId,
    },
    actorId,
  );
}

async function main() {
  const owner = await prisma.user.findFirst({
    where: { role: "OWNER", isActive: true },
  });
  if (!owner) {
    throw new Error("No owner user. Run npm run db:seed first.");
  }

  const warehouse = await ensureWarehouse();
  const shelf = await getDemoShelf(warehouse.id);
  if (!shelf) throw new Error("Demo shelf missing");

  const partner = await ensurePartner();

  const users: Record<string, string> = {};
  for (const u of DEMO_USERS) {
    const whId =
      u.role === "WAREHOUSE_STAFF" ||
      u.role === "WAREHOUSE_MANAGER" ||
      u.role === "DELIVERY_BOY" ||
      u.role === "DELIVERY_MANAGER"
        ? warehouse.id
        : undefined;
    const row = await upsertDemoUser(u.email, u.displayName, u.role, whId);
    users[u.role] = row.email!;
  }

  const rider = await prisma.user.findUniqueOrThrow({
    where: { email: "rider@demo.agentic.local" },
  });
  const rider2 = await prisma.user.findUniqueOrThrow({
    where: { email: "deliveryboy@demo.agentic.local" },
  });

  const p1 = await ensureParcel(
    partner.id,
    warehouse.id,
    "DEMO-AWB-001",
    {
      receiverName: "Rahul Sharma",
      receiverPhone: "9876500001",
      addressLine1: "12 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      paymentType: PaymentType.PREPAID,
    },
    owner.id,
  );

  await ensureParcel(
    partner.id,
    warehouse.id,
    "DEMO-AWB-002",
    {
      receiverName: "Priya Patel",
      receiverPhone: "9876500002",
      addressLine1: "45 Park Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400002",
      paymentType: PaymentType.COD,
      codAmount: 499,
    },
    owner.id,
  );

  let p3 = await ensureParcel(
    partner.id,
    warehouse.id,
    "DEMO-AWB-003",
    {
      receiverName: "Amit Kumar",
      receiverPhone: "9876500003",
      addressLine1: "78 Link Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
      paymentType: PaymentType.PREPAID,
    },
    owner.id,
  );

  if (p3.status === "EXPECTED") {
    await receiveParcel(p3.id, owner.id);
    await weighParcel(p3.id, 1.2, owner.id);
    await storeParcel(p3.id, shelf.id, owner.id);
    await sortParcel(p3.id, owner.id);
    p3 = await prisma.parcel.findUniqueOrThrow({ where: { id: p3.id } });
  }

  let p4 = await ensureParcel(
    partner.id,
    warehouse.id,
    "DEMO-AWB-RIDER",
    {
      receiverName: "Sneha Reddy",
      receiverPhone: "9876500004",
      addressLine1: "9 Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      paymentType: PaymentType.COD,
      codAmount: 850,
    },
    owner.id,
  );

  await ensureOutForDelivery(p4.id, rider.id, owner.id, warehouse.id, shelf.id);

  let p5 = await ensureParcel(
    partner.id,
    warehouse.id,
    "DEMO-AWB-RIDER2",
    {
      receiverName: "Karan Mehta",
      receiverPhone: "9876500005",
      addressLine1: "22 Powai Lake Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076",
      paymentType: PaymentType.PREPAID,
    },
    owner.id,
  );
  await ensureOutForDelivery(p5.id, rider2.id, owner.id, warehouse.id, shelf.id);

  await seedFleetPing(rider.id, 19.0596, 72.8295);
  await seedFleetPing(rider2.id, 19.1176, 72.906);

  console.log("\n=== Demo data ready ===\n");
  console.log("App: https://agentic-logistics.vercel.app/login\n");
  console.log("Password for all demo users:", DEMO_PASSWORD);
  console.log("\n| Role | Email |");
  console.log("|------|-------|");
  console.log("| Owner (existing) | owner@agentic.local / changeme123 |");
  for (const u of DEMO_USERS) {
    console.log(`| ${u.role} | ${u.email} |`);
  }
  console.log("\nDemo partner: DEMO");
  console.log("Demo warehouse: DEMO-HQ (Mumbai)");
  console.log("\nSample parcels:");
  console.log("- DEMO-AWB-001, DEMO-AWB-002 → EXPECTED (receive in Warehouse)");
  console.log("- DEMO-AWB-003 → SORTED (ready for delivery batch)");
  console.log("- DEMO-AWB-RIDER → OUT_FOR_DELIVERY → rider@demo.agentic.local");
  console.log("- DEMO-AWB-RIDER2 → OUT_FOR_DELIVERY → deliveryboy@demo.agentic.local");
  console.log("\nDelivery boy UI: /delivery/my (login as rider accounts above)");
  console.log("Fleet map (managers/owner): /fleet — demo GPS pings seeded for both riders");
  console.log("\nTrack public: use internal ID", p1.internalId, "or AWB DEMO-AWB-001");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
