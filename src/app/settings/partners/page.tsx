import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import PartnersSettingsClient from "./partners-settings-client";

export default async function PartnersSettingsPage() {
  await requirePageUser();
  return withAppShell(<PartnersSettingsClient />);
}
