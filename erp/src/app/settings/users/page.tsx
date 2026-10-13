import { withSettingsPage } from "@/lib/settings-layout";
import { UsersClient } from "./users-client";

export default async function SettingsUsersPage() {
  return withSettingsPage(<UsersClient />);
}
