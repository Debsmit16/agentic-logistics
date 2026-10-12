import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  await requirePermission(AppModule.PROFILE, "canRead");
  return withAppLayout(<ProfileClient />);
}
