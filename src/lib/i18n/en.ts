export const en = {
  appName: "Agentic Logistics",
  login: "Log in",
  receiveParcel: "Receive Parcel",
  storeParcel: "Store Parcel",
  myDeliveries: "My Deliveries",
  dashboard: "Dashboard",
  warehouse: "Warehouse",
  delivery: "Delivery",
  track: "Track parcel",
  forgotPassword: "Forgot password?",
  notifications: "Notifications",
  exceptions: "Exceptions",
  settings: "Settings",
} as const;

export type MessageKey = keyof typeof en;
