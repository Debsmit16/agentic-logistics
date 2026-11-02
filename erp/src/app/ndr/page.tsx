import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import { getNdrOrders } from "@/lib/ndr/ndr-service";
import { NdrClient } from "./ndr-client";

export const metadata = {
  title: "NDR Exception Management | Agentic Logistics",
  description:
    "Non-Delivery Report (NDR) resolution center, customer delivery rescheduling, and RTO governance.",
};

export default async function NdrPage() {
  await requirePermission(AppModule.ORDERS, "canRead");
  const orders = await getNdrOrders();

  return withAppLayout(<NdrClient initialOrders={orders} />);
}

