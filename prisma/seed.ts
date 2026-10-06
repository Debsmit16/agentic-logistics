import { hashPassword } from "../src/lib/auth/crypto";
import { DEFAULT_POD } from "../src/lib/config/system-config";
import { DEFAULT_GST } from "../src/lib/finance/gst-invoice-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
    const password = process.env.SEED_OWNER_PASSWORD ?? "changeme123";
    await prisma.user.create({
      data: {
        email: process.env.SEED_OWNER_EMAIL ?? "owner@agentic.local",
        displayName: "Owner",
        role: "OWNER",
        passwordHash: await hashPassword(password),
      },
    });
    console.log(
      `Created owner ${process.env.SEED_OWNER_EMAIL ?? "owner@agentic.local"} / ${password}`,
    );
  }

  await prisma.deliveryFailureReason.createMany({
    data: [
      { code: "CUSTOMER_UNAVAILABLE", label: "Customer not available", sortOrder: 1 },
      { code: "WRONG_ADDRESS", label: "Wrong address", sortOrder: 2 },
      { code: "REFUSED", label: "Customer refused", sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  await prisma.systemConfig.upsert({
    where: { key: "pod.requirements" },
    create: { key: "pod.requirements", value: DEFAULT_POD },
    update: { value: DEFAULT_POD },
  });

  await prisma.systemConfig.upsert({
    where: { key: "gst.profile" },
    create: { key: "gst.profile", value: DEFAULT_GST },
    update: { value: DEFAULT_GST },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
