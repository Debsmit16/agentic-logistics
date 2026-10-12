import { AppModule, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@agenticlogistics.in";
const ALL_MODULES = Object.values(AppModule);

const FULL = { canCreate: true, canRead: true, canUpdate: true, canDelete: true };
const READ = { canCreate: false, canRead: true, canUpdate: false, canDelete: false };

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "System Admin" },
    update: { description: "Full access to all modules", isSystem: true },
    create: {
      name: "System Admin",
      description: "Full access to all modules",
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

  const viewerRole = await prisma.role.upsert({
    where: { name: "Viewer" },
    update: { description: "Read-only access to operational modules" },
    create: { name: "Viewer", description: "Read-only access to operational modules" },
  });

  for (const module of [AppModule.PARCELS, AppModule.WAREHOUSE, AppModule.DELIVERY, AppModule.LOGS]) {
    await prisma.rolePermission.upsert({
      where: { roleId_module: { roleId: viewerRole.id, module } },
      update: READ,
      create: { roleId: viewerRole.id, module, ...READ },
    });
  }
  await prisma.rolePermission.upsert({
    where: { roleId_module: { roleId: viewerRole.id, module: AppModule.PROFILE } },
    update: { ...READ, canUpdate: true },
    create: {
      roleId: viewerRole.id,
      module: AppModule.PROFILE,
      canCreate: false,
      canRead: true,
      canUpdate: true,
      canDelete: false,
    },
  });

  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await hashPassword(password);

  await prisma.user.deleteMany({ where: { email: "admin@agentic.local" } });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      displayName: "Administrator",
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      email: ADMIN_EMAIL,
      displayName: "Administrator",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  console.log(`Seed OK — login: ${ADMIN_EMAIL} / (password from SEED_ADMIN_PASSWORD or default admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
