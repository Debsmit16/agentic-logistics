import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import FleetClient from "./fleet-client";

export default async function FleetPage() {
  await requirePageUser();
  return withAppShell(<FleetClient />);
}
