import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import FinanceClient from "./finance-client";

export default async function FinancePage() {
  await requirePageUser();
  return withAppShell(<FinanceClient />);
}
