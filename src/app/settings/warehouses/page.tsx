import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import WarehousesSettingsClient from "./warehouses-settings-client";

export default async function WarehousesSettingsPage() {
  await requirePageUser();
  return withAppShell(<WarehousesSettingsClient />);
}
