import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getPublicLocale } from "@/lib/i18n/public-locale";
import { ThemeProvider } from "@/components/theme/theme-provider";

const siteName = "Agentic Logistics";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: "High-precision warehouse and last-mile logistics operating system",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080b11" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPublicLocale();
  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <body className="min-h-screen antialiased bg-slate-950 text-slate-100 transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
