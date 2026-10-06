import { withAppShell, requirePageUser } from "@/lib/auth/page-auth";
import SystemSettingsClient from "./system-settings-client";

export default async function SystemSettingsPage() {
  await requirePageUser();
  return withAppShell(<SystemSettingsClient />);
}
