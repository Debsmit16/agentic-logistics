import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { NotificationChannel } from "@prisma/client";

export async function notifyUser(input: {
  userId: string;
  title: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      channel: NotificationChannel.IN_APP,
      metadata: input.metadata,
    },
  });
}

export async function notifyRoles(
  roles: import("@prisma/client").SystemRole[],
  input: { title: string; body: string; metadata?: Prisma.InputJsonValue },
) {
  const users = await prisma.user.findMany({
    where: { role: { in: roles }, isActive: true, deletedAt: null },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title: input.title,
      body: input.body,
      channel: NotificationChannel.IN_APP,
      metadata: input.metadata,
    })),
  });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
