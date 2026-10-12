import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";

export async function withSettingsPage(children: React.ReactNode) {
  await requirePermission(AppModule.SETTINGS, "canRead");
  return withAppLayout(<div className="mx-auto w-full max-w-6xl">{children}</div>);
}
