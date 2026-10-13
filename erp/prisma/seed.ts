import { AppModule, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@agenticlogistics.in";
const ALL_MODULES = Object.values(AppModule);

const FULL = { canCreate: true, canRead: true, canUpdate: true, canDelete: true };

async function main() {
  console.log("Seeding core roles & permissions...");
  const adminRole = await prisma.role.upsert({
    where: { name: "System Admin" },
    update: { description: "Full access to all operational & settings modules", isSystem: true },
    create: {
      name: "System Admin",
      description: "Full access to all operational & settings modules",
      isSystem: true,
    },
  });

  for (const module of ALL_MODULES) {
    await prisma.rolePermission.upsert({
      where: { roleId_module: { roleId: adminRole.id, module } },
      update: FULL,
      create: { roleId: adminRole.id, module, ...FULL },
    });
  }

  const managerRole = await prisma.role.upsert({
    where: { name: "Operations Manager" },
    update: { description: "Manage warehouse, parcels, delivery and finance" },
    create: { name: "Operations Manager", description: "Manage warehouse, parcels, delivery and finance" },
  });

  for (const module of [
    AppModule.PARCELS,
    AppModule.WAREHOUSE,
    AppModule.DELIVERY,
    AppModule.FINANCE,
    AppModule.LOGS,
    AppModule.PROFILE,
  ]) {
    await prisma.rolePermission.upsert({
      where: { roleId_module: { roleId: managerRole.id, module } },
      update: FULL,
      create: { roleId: managerRole.id, module, ...FULL },
    });
  }

  const riderRole = await prisma.role.upsert({
    where: { name: "Delivery Rider" },
    update: { description: "Delivery dispatch access & proof of delivery" },
    create: { name: "Delivery Rider", description: "Delivery dispatch access & proof of delivery" },
  });

  for (const module of [AppModule.DELIVERY, AppModule.PROFILE]) {
    await prisma.rolePermission.upsert({
      where: { roleId_module: { roleId: riderRole.id, module } },
      update: { canCreate: false, canRead: true, canUpdate: true, canDelete: false },
      create: { roleId: riderRole.id, module, canCreate: false, canRead: true, canUpdate: true, canDelete: false },
    });
  }

  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await hashPassword(password);

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      displayName: "Dev Administrator",
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      email: ADMIN_EMAIL,
      displayName: "Dev Administrator",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  const riderUser = await prisma.user.upsert({
    where: { email: "rider@agenticlogistics.in" },
    update: {
      displayName: "Vikram Malhotra (Rider #408)",
      phone: "+91 98201 55432",
      department: "Last Mile Delivery",
      passwordHash,
      roleId: riderRole.id,
      isActive: true,
    },
    create: {
      email: "rider@agenticlogistics.in",
      displayName: "Vikram Malhotra (Rider #408)",
      phone: "+91 98201 55432",
      department: "Last Mile Delivery",
      passwordHash,
      roleId: riderRole.id,
    },
  });

  console.log("Seeding system configuration...");
  await prisma.systemSetting.upsert({
    where: { key: "site_name" },
    update: { value: "Agentic Logistics ERP" },
    create: { key: "site_name", value: "Agentic Logistics ERP" },
  });

  await prisma.systemSetting.upsert({
    where: { key: "log_retention_days" },
    update: { value: "90" },
    create: { key: "log_retention_days", value: "90" },
  });

  console.log(`Database seeded clean! Admin: ${adminUser.email}, Rider: ${riderUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });