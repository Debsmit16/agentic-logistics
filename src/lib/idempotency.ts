import { prisma } from "@/lib/db";

export async function withIdempotency<T>(
  key: string,
  ttlMs: number,
  handler: () => Promise<T>,
): Promise<T> {
  const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (existing && existing.expiresAt > new Date() && existing.response) {
    return existing.response as T;
  }

  const result = await handler();
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.idempotencyKey.upsert({
    where: { key },
    create: { key, response: result as object, expiresAt },
    update: { response: result as object, expiresAt },
  });

  return result;
}
