import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import InvoicesClient from "./invoices-client";

export default async function InvoicesPage() {
  await requirePageUser();
  return withAppShell(<InvoicesClient />);
}
