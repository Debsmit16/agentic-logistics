import { AppModule } from "@prisma/client";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";

export default async function DashboardPage() {
  await requirePermission(AppModule.PROFILE, "canRead");

  return withAppLayout(
    <div className="mx-auto max-w-6xl">
      <ErpPageHeader
        title="Dashboard"
        description="Overview of logistics operations. Open a module from the sidebar to get started."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Parcels", "Warehouse", "Delivery", "Finance"].map((label) => (
          <div key={label} className="card p-5">
            <p className="text-sm font-medium text-[var(--text)]">{label}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Module placeholder</p>
          </div>
        ))}
      </div>
    </div>,
  );
}
