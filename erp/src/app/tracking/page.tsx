import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { TrackingClient } from "./tracking-client";

export const metadata = {
  title: "Consignment Tracker | Agentic Logistics",
  description: "Live real-time shipment telemetry, milestone audit history, and digital e-POD verification.",
};

export default async function TrackingPage() {
  await requirePermission(AppModule.ORDERS, "canRead");
  return withAppLayout(<TrackingClient />);
}

