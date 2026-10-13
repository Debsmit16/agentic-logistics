import { AppModule, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuditLogListItem = {
  id: string;
  timestamp: string;
  correlationId: string | null;
  userId: string | null;
  module: string;
  severity: string;
  action: string;
  entityId: string | null;
  ip: string | null;
  userAgent: string | null;
  durationMs: number | null;
  httpMethod: string | null;
  statusCode: number | null;
  requestUrl: string | null;
  oldValues: unknown;
  newValues: unknown;
  user: { id: string; name: string; email: string } | null;
};

export function severityForAction(action: string): string {
  const a = action.toUpperCase();
  if (a.includes("DELETE") || a.includes("LOGIN_FAIL") || a.includes("SECURITY")) return "SECURITY";
  if (a.includes("ERROR") || a.includes("FAIL")) return "ERROR";
  if (a.includes("UPDATE") || a.includes("PATCH") || a.includes("TOGGLE")) return "NOTICE";
  if (a.includes("WARN")) return "WARN";
  return "INFO";
}

export type AuditQueryInput = {
  page: number;
  limit: number;
  search?: string;
  module?: AppModule;
  userId?: string;
  from?: Date;
  to?: Date;
  severity?: string;
};

function buildWhere(input: AuditQueryInput): Prisma.AuditLogWhereInput {
  const and: Prisma.AuditLogWhereInput[] = [];

  if (input.module) and.push({ module: input.module });
  if (input.userId) and.push({ userId: input.userId });
  if (input.from || input.to) {
    and.push({
      createdAt: {
        ...(input.from ? { gte: input.from } : {}),
        ...(input.to ? { lte: input.to } : {}),
      },
    });
  }
  if (input.search) {
    const q = input.search.trim();
    and.push({
      OR: [
        { action: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
        { correlationId: { contains: q, mode: "insensitive" } },
        { ipAddress: { contains: q, mode: "insensitive" } },
        { requestUrl: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (input.severity) {
    const s = input.severity.toUpperCase();
    if (s === "SECURITY") {
      and.push({
        OR: [
          { action: { contains: "DELETE", mode: "insensitive" } },
          { action: { contains: "LOGIN_FAIL", mode: "insensitive" } },
          { action: { contains: "SECURITY", mode: "insensitive" } },
        ],
      });
    } else if (s === "ERROR") {
      and.push({
        OR: [
          { action: { contains: "ERROR", mode: "insensitive" } },
          { action: { contains: "FAIL", mode: "insensitive" } },
        ],
      });
    } else if (s === "WARN") {
      and.push({ action: { contains: "WARN", mode: "insensitive" } });
    } else if (s === "NOTICE") {
      and.push({
        OR: [
          { action: { contains: "UPDATE", mode: "insensitive" } },
          { action: { contains: "PATCH", mode: "insensitive" } },
          { action: { contains: "TOGGLE", mode: "insensitive" } },
        ],
      });
    } else if (s === "INFO") {
      and.push({
        AND: [
          { NOT: { action: { contains: "DELETE", mode: "insensitive" } } },
          { NOT: { action: { contains: "UPDATE", mode: "insensitive" } } },
          { NOT: { action: { contains: "FAIL", mode: "insensitive" } } },
        ],
      });
    }
  }

  return and.length ? { AND: and } : {};
}

type AuditRow = Awaited<
  ReturnType<
    typeof prisma.auditLog.findMany<{
      include: { user: { select: { id: true; email: true; displayName: true } } };
    }>
  >
>[number];

function mapRow(row: AuditRow): AuditLogListItem {
  return {
    id: row.id,
    timestamp: row.createdAt.toISOString(),
    correlationId: row.correlationId,
    userId: row.userId,
    module: row.module,
    severity: severityForAction(row.action),
    action: row.action,
    entityId: row.entityId,
    ip: row.ipAddress,
    userAgent: row.userAgent,
    durationMs: row.durationMs,
    httpMethod: row.httpMethod,
    statusCode: row.statusCode,
    requestUrl: row.requestUrl,
    oldValues: row.oldValues,
    newValues: row.newValues,
    user: row.user
      ? { id: row.user.id, name: row.user.displayName, email: row.user.email }
      : null,
  };
}

export async function queryAuditLogs(input: AuditQueryInput) {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: input.limit,
    skip,
    include: { user: { select: { id: true, email: true, displayName: true } } },
  });

  const total = await prisma.auditLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / input.limit));

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayWhere = { createdAt: { gte: startOfDay } };
  const [todayLogs, uniqueUsersToday] = await Promise.all([
    prisma.auditLog.findMany({ where: todayWhere, select: { action: true, durationMs: true } }),
    prisma.auditLog.findMany({
      where: { ...todayWhere, userId: { not: null } },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  let errorsToday = 0;
  let warningsToday = 0;
  let securityToday = 0;
  let durationSum = 0;
  let durationCount = 0;
  for (const t of todayLogs) {
    const sev = severityForAction(t.action);
    if (sev === "ERROR") errorsToday++;
    if (sev === "WARN") warningsToday++;
    if (sev === "SECURITY") securityToday++;
    if (t.durationMs != null) {
      durationSum += t.durationMs;
      durationCount++;
    }
  }

  const [modules, users] = await Promise.all([
    prisma.auditLog.findMany({ distinct: ["module"], select: { module: true }, orderBy: { module: "asc" } }),
    prisma.user.findMany({
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true, email: true },
    }),
  ]);

  return {
    data: rows.map(mapRow),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
    },
    stats: {
      total,
      errorsToday,
      warningsToday,
      securityToday,
      avgDurationMs: durationCount ? Math.round(durationSum / durationCount) : 0,
      uniqueUsersToday: uniqueUsersToday.length,
    },
    filterOptions: {
      modules: modules.map((m) => m.module),
      users: users.map((u) => ({ id: u.id, name: u.displayName, email: u.email })),
    },
  };
}

export async function getAuditLogById(id: string) {
  const row = await prisma.auditLog.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, displayName: true } } },
  });
  if (!row) return null;
  return mapRow(row);
}

export async function exportAuditLogs(input: Omit<AuditQueryInput, "page" | "limit">, format: "csv" | "json") {
  const result = await queryAuditLogs({ ...input, page: 1, limit: 5000 });
  if (format === "json") {
    return JSON.stringify(result.data, null, 2);
  }
  const header = ["timestamp", "severity", "module", "action", "entityId", "user", "ip", "durationMs"];
  const lines = [header.join(",")];
  for (const row of result.data) {
    lines.push(
      [
        row.timestamp,
        row.severity,
        row.module,
        row.action,
        row.entityId ?? "",
        row.user?.email ?? "",
        row.ip ?? "",
        row.durationMs ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
  }
  return lines.join("\n");
}
