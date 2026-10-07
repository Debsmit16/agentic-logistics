import type { SystemRole } from "@prisma/client";

export type DemoTestAccount = {
  role: SystemRole;
  email: string;
  password: string;
  loginPath: string;
  homePath: string;
};

/** Demo accounts created by `npm run db:demo` — shown only to superadmin (OWNER). */
export const DEMO_TEST_ACCOUNTS: DemoTestAccount[] = [
  {
    role: "WAREHOUSE_MANAGER",
    email: "warehouse@demo.agentic.local",
    password: "demo123456",
    loginPath: "/login",
    homePath: "/warehouse",
  },
  {
    role: "WAREHOUSE_STAFF",
    email: "staff@demo.agentic.local",
    password: "demo123456",
    loginPath: "/login",
    homePath: "/warehouse",
  },
  {
    role: "DELIVERY_MANAGER",
    email: "delivery.mgr@demo.agentic.local",
    password: "demo123456",
    loginPath: "/login",
    homePath: "/delivery",
  },
  {
    role: "DELIVERY_BOY",
    email: "rider@demo.agentic.local",
    password: "demo123456",
    loginPath: "/login",
    homePath: "/delivery/my",
  },
  {
    role: "DELIVERY_BOY",
    email: "deliveryboy@demo.agentic.local",
    password: "demo123456",
    loginPath: "/login",
    homePath: "/delivery/my",
  },
  {
    role: "ACCOUNTANT",
    email: "accounts@demo.agentic.local",
    password: "demo123456",
    loginPath: "/login",
    homePath: "/finance",
  },
];

export const SUPERADMIN_ACCOUNT = {
  email: "owner@agentic.local",
  password: "changeme123",
};

export function isSuperadminRole(role: SystemRole): boolean {
  return role === "OWNER";
}
