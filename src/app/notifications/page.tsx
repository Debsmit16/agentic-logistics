import { withAppShell, requirePageUser } from "@/lib/auth/page-auth";
import NotificationsClient from "./notifications-client";

export default async function NotificationsPage() {
  await requirePageUser();
  return withAppShell(<NotificationsClient />);
}
