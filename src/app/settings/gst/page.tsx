import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import GstSettingsClient from "./gst-settings-client";

export default async function GstSettingsPage() {
  await requirePageUser();
  return withAppShell(<GstSettingsClient />);
}
