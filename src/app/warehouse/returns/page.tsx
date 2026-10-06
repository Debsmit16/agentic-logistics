import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import ReturnsClient from "./returns-client";

export default async function ReturnsPage() {
  await requirePageUser();
  return withAppShell(<ReturnsClient />);
}
