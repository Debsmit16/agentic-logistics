import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import MyDeliveriesClient from "./my-deliveries-client";

export default async function MyDeliveriesPage() {
  await requirePageUser();
  return withAppShell(<MyDeliveriesClient />);
}
