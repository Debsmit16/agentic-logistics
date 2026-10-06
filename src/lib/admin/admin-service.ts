import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/crypto";
import type { SystemRole } from "@prisma/client";

export async function listWarehouses() {
  return prisma.warehouse.findMany({
    where: { deletedAt: null },
    include: {
      zones: {
        include: {
          racks: {
            include: { shelves: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createWarehouse(data: {
  code: string;
  name: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
}) {
  return prisma.warehouse.create({ data: { ...data, isActive: true } });
}

export async function createZone(warehouseId: string, code: string, name: string) {
  return prisma.warehouseZone.create({
    data: { warehouseId, code, name, isActive: true },
  });
}

export async function createRack(zoneId: string, code: string, name?: string) {
  return prisma.warehouseRack.create({
    data: { zoneId, code, name, isActive: true },
  });
}

export async function createShelf(rackId: string, code: string, label: string) {
  return prisma.warehouseShelf.create({
    data: { rackId, code, label, isActive: true },
  });
}

export async function listPartners() {
  return prisma.partner.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function createPartner(data: {
  code: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  return prisma.partner.create({ data: { ...data, isActive: true } });
}

export async function updatePartner(
  id: string,
  data: Partial<{
    name: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
  }>,
) {
  return prisma.partner.update({ where: { id }, data });
}

export async function listEmployees() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      warehouseId: true,
      createdAt: true,
    },
    orderBy: { displayName: "asc" },
  });
}

export async function createEmployee(
  data: {
    displayName: string;
    email?: string;
    phone?: string;
    role: SystemRole;
    password: string;
    warehouseId?: string;
  },
  actorId: string,
) {
  if (!data.email && !data.phone) {
    throw new Error("Email or phone is required.");
  }
  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      displayName: data.displayName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      role: data.role,
      passwordHash,
      warehouseId: data.warehouseId ?? null,
    },
  });
  await writeAuditLog({
    actorId,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    after: { role: user.role, displayName: user.displayName },
  });
  return user;
}

export async function updateEmployee(
  id: string,
  data: Partial<{
    displayName: string;
    role: SystemRole;
    isActive: boolean;
    warehouseId: string | null;
    password: string;
  }>,
  actorId: string,
) {
  const updates: {
    displayName?: string;
    role?: SystemRole;
    isActive?: boolean;
    warehouseId?: string | null;
    passwordHash?: string;
    deletedAt?: Date | null;
  } = {};

  if (data.displayName != null) updates.displayName = data.displayName;
  if (data.role != null) updates.role = data.role;
  if (data.isActive != null) {
    updates.isActive = data.isActive;
    updates.deletedAt = data.isActive ? null : new Date();
  }
  if (data.warehouseId !== undefined) updates.warehouseId = data.warehouseId;
  if (data.password) updates.passwordHash = await hashPassword(data.password);

  const user = await prisma.user.update({ where: { id }, data: updates });

  await writeAuditLog({
    actorId,
    action: "user.update",
    entityType: "User",
    entityId: id,
    after: { role: user.role, isActive: user.isActive },
  });

  return user;
}

export async function getPartnerWebhookIntegration(partnerId: string) {
  return prisma.partnerIntegration.findUnique({
    where: { partnerId_providerKey: { partnerId, providerKey: "webhook" } },
  });
}

export async function setPartnerWebhookSecret(partnerId: string, webhookSecret: string | null) {
  return prisma.partnerIntegration.upsert({
    where: { partnerId_providerKey: { partnerId, providerKey: "webhook" } },
    create: {
      partnerId,
      providerKey: "webhook",
      webhookSecret: webhookSecret || null,
      isActive: true,
    },
    update: { webhookSecret: webhookSecret || null, isActive: true },
  });
}

export async function listCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { phone: { contains: search } },
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { parcels: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}

export async function createCustomerRecord(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  return prisma.customer.create({ data });
}

export async function listShelvesForWarehouse(warehouseId: string) {
  return prisma.warehouseShelf.findMany({
    where: {
      isActive: true,
      rack: { zone: { warehouseId } },
    },
    include: { rack: { include: { zone: true } } },
    orderBy: { label: "asc" },
  });
}

export async function listDeliveryBoys(warehouseId?: string) {
  return prisma.user.findMany({
    where: {
      role: "DELIVERY_BOY",
      isActive: true,
      deletedAt: null,
      ...(warehouseId ? { warehouseId } : {}),
    },
    select: { id: true, displayName: true, phone: true, warehouseId: true },
    orderBy: { displayName: "asc" },
  });
}
