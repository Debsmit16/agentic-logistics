import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import AuditClient from "./audit-client";

export default async function AuditPage() {
  await requirePageUser();
  return withAppShell(<AuditClient />);
}
