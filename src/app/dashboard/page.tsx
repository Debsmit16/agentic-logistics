import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";

export default async function DashboardPage() {
  await requirePermission(AppModule.PROFILE, "canRead");

  return withAppLayout(
    <div>
      <h1 className="page-title">Home</h1>
      <p className="page-lead">Choose a module from the menu above.</p>
    </div>,
  );
}
