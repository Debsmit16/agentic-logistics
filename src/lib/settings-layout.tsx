import { AppModule } from "@prisma/client";
import { SettingsSubNav } from "@/components/layout/settings-sub-nav";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";

export async function withSettingsPage(children: React.ReactNode) {
  await requirePermission(AppModule.SETTINGS, "canRead");

  return withAppLayout(
    <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:gap-10">
      <SettingsSubNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>,
  );
}
