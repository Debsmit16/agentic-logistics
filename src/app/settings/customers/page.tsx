import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import CustomersSettingsClient from "./customers-settings-client";

export default async function CustomersSettingsPage() {
  await requirePageUser();
  return withAppShell(<CustomersSettingsClient />);
}
