import { withSettingsPage } from "@/lib/settings-layout";
import { LogsClient } from "./logs-client";

export default async function SettingsLogsPage() {
  return withSettingsPage(<LogsClient />);
}
