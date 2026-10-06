import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import ReceiveClient from "./receive-client";

export default async function ReceivePage() {
  await requirePageUser();
  return withAppShell(<ReceiveClient />);
}
