import { withAppShell, requirePageUser } from "@/lib/auth/page-auth";
import DeliveryFailedClient from "./failed-client";

export default async function DeliveryFailedPage() {
  await requirePageUser();
  return withAppShell(<DeliveryFailedClient />);
}
