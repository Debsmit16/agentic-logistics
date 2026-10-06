import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import ParcelsClient from "./parcels-client";

export default async function ParcelsPage() {
  await requirePageUser();
  return withAppShell(<ParcelsClient />);
}
