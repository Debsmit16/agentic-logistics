import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getPublicLocale } from "@/lib/i18n/public-locale";
import { ThemeProvider } from "@/components/theme/theme-provider";

const siteName = "Agentic Logistics";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Agentic Logistics · Autonomous Freight & Fulfillment OS",
    template: `%s · ${siteName}`,
  },
  description: "Enterprise autonomous logistics, warehouse sortation, real-time fleet telematics, and automated GST reconciliation platform.",
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
    title: "Agentic Logistics · Autonomous Logistics Operating System",
    description: "Enterprise warehouse sortation, real-time fleet GPS, and automated GST reconciliation.",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: siteName }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#06090f" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPublicLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
