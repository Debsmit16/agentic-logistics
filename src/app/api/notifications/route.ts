import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiUser } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    const user = await requireApiUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unread = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return NextResponse.json({ notifications, unread });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH() {
  try {
    const user = await requireApiUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
