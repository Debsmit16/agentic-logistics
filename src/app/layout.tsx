import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, LOGO } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Logistics platform with RBAC",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: LOGO.sm, sizes: "64x64", type: "image/png" },
      { url: LOGO.md, sizes: "128x128", type: "image/png" },
    ],
    apple: [{ url: LOGO.md, sizes: "128x128", type: "image/png" }],
    shortcut: LOGO.sm,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
