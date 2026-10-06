import { withAppShell, requirePageUser } from "@/lib/auth/page-auth";
import ExceptionsClient from "./exceptions-client";

export default async function ExceptionsPage() {
  await requirePageUser();
  return withAppShell(<ExceptionsClient />);
}
