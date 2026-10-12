import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { exportAuditLogs } from "@/lib/logs/audit-query";

export async function GET(req: Request) {
  try {
    await requireApiPermission(AppModule.SETTINGS, "canRead");
    const url = new URL(req.url);
    const format = url.searchParams.get("format") === "json" ? "json" : "csv";
    const search = url.searchParams.get("search") ?? undefined;
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

    const body = await exportAuditLogs(
      {
        search,
        module,
        userId,
        severity,
        from: from && !Number.isNaN(from.getTime()) ? from : undefined,
        to: to && !Number.isNaN(to.getTime()) ? to : undefined,
      },
      format,
    );

    const date = new Date().toISOString().slice(0, 10);
    const contentType = format === "json" ? "application/json" : "text/csv; charset=utf-8";
    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="system-logs-${date}.${format}"`,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
