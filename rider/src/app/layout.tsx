import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { APP_NAME, APP_SHORT_NAME, LOGO } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${APP_NAME} | Enterprise Field Operations`,
  description: "Enterprise Last-Mile Delivery Run-Sheet & Digital e-POD Verification Platform",
  applicationName: APP_SHORT_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_SHORT_NAME,
  },
  icons: {
    icon: LOGO.sm,
    apple: LOGO.lg,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070b14",
};

const swRegisterScript = `
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: swRegisterScript }}
        />
      </head>
      <body className="min-h-screen safe-top safe-bottom bg-[#070b14] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
