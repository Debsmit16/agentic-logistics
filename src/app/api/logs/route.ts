import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";

export async function GET(req: Request) {
  try {
    await requireApiPermission(AppModule.SETTINGS, "canRead");
    const url = new URL(req.url);
    const module = url.searchParams.get("module") as AppModule | null;
    const q = url.searchParams.get("q")?.trim();
    const take = Math.min(Number(url.searchParams.get("take") ?? 50), 100);
    const skip = Number(url.searchParams.get("skip") ?? 0);

    const where = {
      ...(module ? { module } : {}),
      ...(q
        ? {
            OR: [
              { action: { contains: q, mode: "insensitive" as const } },
              { entityId: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: { user: { select: { id: true, email: true, displayName: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (e) {
    return jsonError(e);
  }
}
