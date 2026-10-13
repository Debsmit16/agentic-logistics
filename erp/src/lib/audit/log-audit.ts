import { headers } from "next/headers";
import type { AppModule, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionPayload } from "@/lib/auth/session";

export type LogAuditParams = {
  action: string;
  module: AppModule;
  entityId?: string;
  correlationId?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  durationMs?: number;
  userId?: string | null;
  httpMethod?: string;
  statusCode?: number;
  requestUrl?: string;
};

export async function logAudit(params: LogAuditParams) {
  try {
    const session = await getSessionPayload();
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
      userAgent = h.get("user-agent");
    } catch {
      /* background / edge */
    }

    const correlationId = params.correlationId ?? crypto.randomUUID();

    void prisma.auditLog
      .create({
        data: {
          userId: params.userId ?? session?.sub ?? null,
          action: params.action,
          module: params.module,
          entityId: params.entityId,
          correlationId,
          oldValues: params.oldValues ?? undefined,
          newValues: params.newValues ?? undefined,
          ipAddress,
          userAgent,
          httpMethod: params.httpMethod,
          statusCode: params.statusCode,
          requestUrl: params.requestUrl,
          durationMs: params.durationMs,
        },
      })
      .catch((err) => console.error("[AuditLog]", err));
  } catch (err) {
    console.error("[AuditLog]", err);
  }
}
