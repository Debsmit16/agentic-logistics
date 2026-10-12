import { execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

if (!process.env.PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT) {
  process.env.PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT = "60000";
}

const attempts = 3;

for (let i = 1; i <= attempts; i++) {
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
    process.exit(0);
  } catch {
    console.error(`[migrate] attempt ${i}/${attempts} failed`);
    if (i === attempts) process.exit(1);
    const waitMs = i * 10_000;
    console.log(`[migrate] retrying in ${waitMs / 1000}s…`);
    await sleep(waitMs);
  }
}
