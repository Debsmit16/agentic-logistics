import { AppModule } from "@prisma/client";
import { withAppLayout } from "@/lib/app-layout";
import { requirePermission } from "@/lib/permissions";
import {
  getTripsForSettlement,
  getMerchantRemittanceList,
} from "@/lib/finance/settlement-service";
import { ReconciliationClient } from "./reconciliation-client";

export const metadata = {
  title: "Cash Settlement & Invoicing | Agentic Logistics",
  description:
    "Hub Cash Handover Reconciliation, Merchant COD Remittance Ledger, and GST Freight Invoicing.",
};

export default async function ReconciliationPage() {
  await requirePermission(AppModule.ORDERS, "canRead");

  const [trips, remittances] = await Promise.all([
    getTripsForSettlement(),
    getMerchantRemittanceList(),
  ]);

  return withAppLayout(
    <ReconciliationClient initialTrips={trips} initialRemittances={remittances} />
  );
}

