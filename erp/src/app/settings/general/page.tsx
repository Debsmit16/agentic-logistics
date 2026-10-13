import { withSettingsPage } from "@/lib/settings-layout";
import { GeneralClient } from "./general-client";

export default async function SettingsGeneralPage() {
  return withSettingsPage(<GeneralClient />);
}
