import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { OrdersClient } from "./orders-client";

export const metadata = {
  title: "Orders Management | Agentic Logistics",
  description: "Enterprise consignment booking, AWB telemetry tracking, and dispatch lifecycle control.",
};

export default async function OrdersPage() {
  await requirePermission(AppModule.ORDERS, "canRead");
  return withAppLayout(<OrdersClient />);
}
