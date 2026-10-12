import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import { withSettingsPage } from "@/lib/settings-layout";
import { LogsClient } from "./logs-client";

export const metadata: Metadata = {
  title: `System Logs | ${APP_NAME}`,
  description: "Enterprise audit trail and system event log viewer",
};

export default async function SettingsLogsPage() {
  return withSettingsPage(<LogsClient />);
}
