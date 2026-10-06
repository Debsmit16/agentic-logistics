import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import EmployeesSettingsClient from "./employees-settings-client";

export default async function EmployeesSettingsPage() {
  await requirePageUser();
  return withAppShell(<EmployeesSettingsClient />);
}
