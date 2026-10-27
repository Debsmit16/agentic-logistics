import { withAppLayout } from "@/lib/app-layout";
import { requireUser } from "@/lib/permissions";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  await requireUser();
  return withAppLayout(<ProfileClient />);
}
