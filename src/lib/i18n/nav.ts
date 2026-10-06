import type { SystemRole } from "@prisma/client";
import type { MessageKey } from "./en";

export type NavItem = { href: string; key: MessageKey };

export const ROLE_NAV: Partial<Record<SystemRole, NavItem[]>> = {
  OWNER: [
    { href: "/dashboard", key: "dashboard" },
    { href: "/parcels", key: "navParcels" },
    { href: "/warehouse", key: "warehouse" },
    { href: "/delivery", key: "delivery" },
    { href: "/fleet", key: "navFleet" },
    { href: "/finance", key: "navCod" },
    { href: "/finance/invoices", key: "navInvoices" },
    { href: "/settings/partners", key: "navPartners" },
    { href: "/settings/customers", key: "navCustomers" },
    { href: "/settings/warehouses", key: "navWarehouses" },
    { href: "/settings/employees", key: "navEmployees" },
    { href: "/settings/gst", key: "navGstSettings" },
    { href: "/reports", key: "navReports" },
    { href: "/notifications", key: "navAlerts" },
    { href: "/exceptions", key: "exceptions" },
    { href: "/settings/system", key: "navSystem" },
    { href: "/settings/audit", key: "navAudit" },
  ],
  ADMIN: [
    { href: "/dashboard", key: "dashboard" },
    { href: "/parcels", key: "navParcels" },
    { href: "/warehouse", key: "warehouse" },
    { href: "/delivery", key: "delivery" },
    { href: "/fleet", key: "navFleet" },
    { href: "/finance/invoices", key: "navInvoices" },
    { href: "/settings/partners", key: "navPartners" },
    { href: "/settings/customers", key: "navCustomers" },
    { href: "/settings/warehouses", key: "navWarehouses" },
    { href: "/settings/employees", key: "navEmployees" },
    { href: "/reports", key: "navReports" },
  ],
  WAREHOUSE_MANAGER: [
    { href: "/warehouse", key: "warehouse" },
    { href: "/parcels", key: "navParcels" },
    { href: "/delivery", key: "delivery" },
    { href: "/fleet", key: "navFleet" },
  ],
  WAREHOUSE_STAFF: [
    { href: "/warehouse", key: "warehouse" },
    { href: "/parcels", key: "navFind" },
  ],
  DELIVERY_MANAGER: [
    { href: "/delivery", key: "delivery" },
    { href: "/delivery/failed", key: "navFailed" },
    { href: "/fleet", key: "navFleet" },
    { href: "/parcels", key: "navParcels" },
  ],
  DELIVERY_BOY: [{ href: "/delivery/my", key: "myDeliveries" }],
  ACCOUNTANT: [
    { href: "/finance", key: "navCod" },
    { href: "/finance/invoices", key: "navInvoices" },
    { href: "/reports", key: "navReports" },
  ],
};
