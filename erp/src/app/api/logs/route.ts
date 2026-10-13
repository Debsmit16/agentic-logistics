import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { queryAuditLogs } from "@/lib/logs/audit-query";

export async function GET(req: Request) {
  try {
    await requireApiPermission(AppModule.SETTINGS, "canRead");
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(Math.max(1, Number(url.searchParams.get("limit") ?? 50)), 100);
    const search = url.searchParams.get("search") ?? url.searchParams.get("q") ?? undefined;
    const moduleParam = url.searchParams.get("module");
    const module =
      moduleParam && Object.values(AppModule).includes(moduleParam as AppModule)
        ? (moduleParam as AppModule)
        : undefined;
    const userId = url.searchParams.get("userId") ?? undefined;
    const severity = url.searchParams.get("severity") ?? undefined;
    const fromRaw = url.searchParams.get("from");
    const toRaw = url.searchParams.get("to");
    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;

    const result = await queryAuditLogs({
      page,
      limit,
      search: search || undefined,
      module,
      userId,
      severity,
      from: from && !Number.isNaN(from.getTime()) ? from : undefined,
      to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    });

    return NextResponse.json(result);
  } catch (e) {
    return jsonError(e);
  }
}
