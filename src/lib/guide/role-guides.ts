import type { SystemRole } from "@prisma/client";
import type { MessageKey } from "@/lib/i18n/en";

export type GuideStep = {
  id: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  href?: string;
};

export const ROLE_GUIDE_STEPS: Record<SystemRole, GuideStep[]> = {
  OWNER: [
    {
      id: "setup",
      titleKey: "guideStepSetup",
      bodyKey: "guideStepSetupBody",
      href: "/settings/warehouses",
    },
    {
      id: "parcels",
      titleKey: "guideStepParcels",
      bodyKey: "guideStepParcelsBody",
      href: "/parcels",
    },
    {
      id: "warehouse",
      titleKey: "guideStepWarehouse",
      bodyKey: "guideStepWarehouseBody",
      href: "/warehouse",
    },
    {
      id: "delivery",
      titleKey: "guideStepDelivery",
      bodyKey: "guideStepDeliveryBody",
      href: "/delivery",
    },
    {
      id: "finance",
      titleKey: "guideStepFinance",
      bodyKey: "guideStepFinanceBody",
      href: "/finance",
    },
  ],
  ADMIN: [
    {
      id: "setup",
      titleKey: "guideStepSetup",
      bodyKey: "guideStepSetupBody",
      href: "/settings/warehouses",
    },
    {
      id: "parcels",
      titleKey: "guideStepParcels",
      bodyKey: "guideStepParcelsBody",
      href: "/parcels",
    },
    {
      id: "delivery",
      titleKey: "guideStepDelivery",
      bodyKey: "guideStepDeliveryBody",
      href: "/delivery",
    },
    {
      id: "reports",
      titleKey: "guideStepReports",
      bodyKey: "guideStepReportsBody",
      href: "/reports",
    },
  ],
  WAREHOUSE_MANAGER: [
    {
      id: "receive",
      titleKey: "guideWhReceive",
      bodyKey: "guideWhReceiveBody",
      href: "/warehouse/receive",
    },
    {
      id: "store",
      titleKey: "guideWhStore",
      bodyKey: "guideWhStoreBody",
      href: "/warehouse/store",
    },
    {
      id: "sort",
      titleKey: "guideWhSort",
      bodyKey: "guideWhSortBody",
      href: "/warehouse/sort",
    },
    {
      id: "handoff",
      titleKey: "guideWhHandoff",
      bodyKey: "guideWhHandoffBody",
      href: "/delivery",
    },
  ],
  WAREHOUSE_STAFF: [
    {
      id: "receive",
      titleKey: "guideWhReceive",
      bodyKey: "guideWhReceiveBody",
      href: "/warehouse/receive",
    },
    {
      id: "store",
      titleKey: "guideWhStore",
      bodyKey: "guideWhStoreBody",
      href: "/warehouse/store",
    },
    {
      id: "find",
      titleKey: "guideWhFind",
      bodyKey: "guideWhFindBody",
      href: "/warehouse/find",
    },
  ],
  DELIVERY_MANAGER: [
    {
      id: "batch",
      titleKey: "guideDmBatch",
      bodyKey: "guideDmBatchBody",
      href: "/delivery",
    },
    {
      id: "assign",
      titleKey: "guideDmAssign",
      bodyKey: "guideDmAssignBody",
      href: "/delivery",
    },
    {
      id: "fleet",
      titleKey: "guideDmFleet",
      bodyKey: "guideDmFleetBody",
      href: "/fleet",
    },
    {
      id: "failed",
      titleKey: "guideDmFailed",
      bodyKey: "guideDmFailedBody",
      href: "/delivery/failed",
    },
  ],
  DELIVERY_BOY: [
    {
      id: "open",
      titleKey: "guideRiderOpen",
      bodyKey: "guideRiderOpenBody",
      href: "/delivery/my",
    },
    {
      id: "navigate",
      titleKey: "guideRiderNavigate",
      bodyKey: "guideRiderNavigateBody",
    },
    {
      id: "pod",
      titleKey: "guideRiderPod",
      bodyKey: "guideRiderPodBody",
    },
    {
      id: "gps",
      titleKey: "guideRiderGps",
      bodyKey: "guideRiderGpsBody",
      href: "/delivery/my",
    },
  ],
  ACCOUNTANT: [
    {
      id: "cod",
      titleKey: "guideAccCod",
      bodyKey: "guideAccCodBody",
      href: "/finance",
    },
    {
      id: "gst",
      titleKey: "guideAccGst",
      bodyKey: "guideAccGstBody",
      href: "/settings/gst",
    },
    {
      id: "invoices",
      titleKey: "guideAccInvoices",
      bodyKey: "guideAccInvoicesBody",
      href: "/finance/invoices",
    },
  ],
};

export const PARCEL_LIFECYCLE: { key: MessageKey; status: string }[] = [
  { key: "lifecycleExpected", status: "EXPECTED" },
  { key: "lifecycleReceived", status: "RECEIVED" },
  { key: "lifecycleStored", status: "STORED" },
  { key: "lifecycleSorted", status: "SORTED" },
  { key: "lifecycleOut", status: "OUT_FOR_DELIVERY" },
  { key: "lifecycleDelivered", status: "DELIVERED" },
];
