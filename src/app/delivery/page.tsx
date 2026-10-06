import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import DeliveryOpsClient from "./delivery-ops-client";

export default async function DeliveryPage() {
  await requirePageUser();
  return withAppShell(<DeliveryOpsClient />);
}
