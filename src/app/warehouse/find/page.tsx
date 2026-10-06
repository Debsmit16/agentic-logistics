import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import FindParcelClient from "./find-client";

export default async function FindPage() {
  await requirePageUser();
  return withAppShell(<FindParcelClient />);
}
