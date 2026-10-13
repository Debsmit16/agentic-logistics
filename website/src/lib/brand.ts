export const APP_NAME = "Agentic Logistics";
export const APP_TAGLINE = "Next-Generation Autonomous Freight Orchestration";

export const LOGO = {
  sm: "/logo-64.png",
  md: "/logo-128.png",
} as const;

export const ERP_URL =
  process.env.NEXT_PUBLIC_ERP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://erp.agenticlogistics.in"
    : "http://localhost:3000");
