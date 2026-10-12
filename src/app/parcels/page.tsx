import { AppModule } from "@prisma/client";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";

export default async function ParcelsPage() {
  await requirePermission(AppModule.PARCELS, "canRead");
  return withAppLayout(<ModulePlaceholder name="Parcels" />);
}
