import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { LogsClient } from "./logs-client";

export default async function LogsPage() {
  await requirePermission(AppModule.LOGS, "canRead");
  return withAppLayout(<LogsClient />);
}
