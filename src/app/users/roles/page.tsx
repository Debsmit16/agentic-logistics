import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { RolesClient } from "./roles-client";

export default async function RolesPage() {
  await requirePermission(AppModule.USERS, "canRead");
  return withAppLayout(<RolesClient />);
}
