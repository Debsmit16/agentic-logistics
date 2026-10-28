import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { DispatchesClient } from "./dispatches-client";

export const metadata = {
  title: "Dispatches & Trips | Agentic Logistics",
  description: "Enterprise fleet trips, driver delivery run-sheets, and linehaul manifest routing.",
};

export default async function DispatchesPage() {
  await requirePermission(AppModule.DISPATCHES, "canRead");
  return withAppLayout(<DispatchesClient />);
}

