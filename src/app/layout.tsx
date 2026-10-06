import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getPublicLocale } from "@/lib/i18n/public-locale";

const siteName = "Agentic Logistics";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: "Warehouse and last-mile logistics management",
  applicationName: siteName,
  icons: {
    icon: [
      { url: "/logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/logo-192.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: siteName,
    description: "Warehouse and last-mile logistics management",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: siteName }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPublicLocale();
  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
