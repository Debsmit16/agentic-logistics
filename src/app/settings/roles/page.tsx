import { withSettingsPage } from "@/lib/settings-layout";
import { RolesClient } from "./roles-client";

export default async function SettingsRolesPage() {
  return withSettingsPage(<RolesClient />);
}
