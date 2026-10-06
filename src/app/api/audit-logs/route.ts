import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("audit.view");
    const logs = await prisma.auditLog.findMany({
      include: { actor: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ logs });
  } catch (e) {
    return handleApiError(e);
  }
}
