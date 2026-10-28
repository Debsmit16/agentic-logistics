import { AppModule, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@agenticlogistics.in";
const ALL_MODULES = [AppModule.ORDERS, AppModule.DISPATCHES, AppModule.SETTINGS];

const FULL = { canCreate: true, canRead: true, canUpdate: true, canDelete: true };

async function main() {
  console.log("Seeding core roles & permissions (Orders & Settings)...");

  // 1. System Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: "System Admin" },
    update: { description: "Full operational access to Orders and Settings", isSystem: true },
    create: {
      name: "System Admin",
      description: "Full operational access to Orders and Settings",
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

  // 2. Operations Dispatcher Role
  const dispatcherRole = await prisma.role.upsert({
    where: { name: "Operations Dispatcher" },
    update: { description: "Create, view and process customer orders and dispatches" },
    create: { name: "Operations Dispatcher", description: "Create, view and process customer orders and dispatches" },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: dispatcherRole.id, module: AppModule.ORDERS } },
    update: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    create: { roleId: dispatcherRole.id, module: AppModule.ORDERS, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: dispatcherRole.id, module: AppModule.DISPATCHES } },
    update: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    create: { roleId: dispatcherRole.id, module: AppModule.DISPATCHES, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: dispatcherRole.id, module: AppModule.SETTINGS } },
    update: { canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    create: { roleId: dispatcherRole.id, module: AppModule.SETTINGS, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
  });

  // 3. Delivery Courier / Field Agent Role
  const courierRole = await prisma.role.upsert({
    where: { name: "Delivery Courier" },
    update: { description: "View order run-sheets and record delivery completions" },
    create: { name: "Delivery Courier", description: "View order run-sheets and record delivery completions" },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: courierRole.id, module: AppModule.ORDERS } },
    update: { canCreate: false, canRead: true, canUpdate: true, canDelete: false },
    create: { roleId: courierRole.id, module: AppModule.ORDERS, canCreate: false, canRead: true, canUpdate: true, canDelete: false },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: courierRole.id, module: AppModule.DISPATCHES } },
    update: { canCreate: false, canRead: true, canUpdate: true, canDelete: false },
    create: { roleId: courierRole.id, module: AppModule.DISPATCHES, canCreate: false, canRead: true, canUpdate: true, canDelete: false },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: courierRole.id, module: AppModule.SETTINGS } },
    update: { canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    create: { roleId: courierRole.id, module: AppModule.SETTINGS, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
  });

  // 4. Default Admin & Rider Users
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

  await prisma.user.upsert({
    where: { email: "rider@agenticlogistics.in" },
    update: {
      displayName: "Vikram Malhotra (Courier #408)",
      phone: "+91 98201 55432",
      department: "Last Mile Operations",
      passwordHash,
      roleId: courierRole.id,
      isActive: true,
    },
    create: {
      email: "rider@agenticlogistics.in",
      displayName: "Vikram Malhotra (Courier #408)",
      phone: "+91 98201 55432",
      department: "Last Mile Operations",
      passwordHash,
      roleId: courierRole.id,
    },
  });

  console.log(`Seed complete! 2 core modules (ORDERS, SETTINGS), Admin: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });