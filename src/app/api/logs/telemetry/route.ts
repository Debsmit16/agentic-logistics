import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { severityForAction } from "@/lib/logs/audit-query";

export async function GET() {
  try {
    await requireApiPermission(AppModule.SETTINGS, "canRead");

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [byModule, recent] = await Promise.all([
      prisma.auditLog.groupBy({
        by: ["module"],
        _count: { id: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: since } },
        select: { action: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: 500,
      }),
    ]);

    const severityBreakdown: Record<string, number> = {};
    for (const row of recent) {
      const s = severityForAction(row.action);
      severityBreakdown[s] = (severityBreakdown[s] ?? 0) + 1;
    }

    const hourly: { hour: string; count: number }[] = [];
    const bucket = new Map<string, number>();
    for (const row of recent) {
      const h = new Date(row.createdAt);
      h.setMinutes(0, 0, 0);
      const key = h.toISOString();
      bucket.set(key, (bucket.get(key) ?? 0) + 1);
    }
    for (const [hour, count] of [...bucket.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      hourly.push({ hour, count });
    }

    return NextResponse.json({
      since: since.toISOString(),
      byModule: byModule.map((m) => ({ module: m.module, count: m._count.id })),
      severityBreakdown,
      hourly,
    });
  } catch (e) {
    return jsonError(e);
  }
}
