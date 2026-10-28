import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { APP_NAME, APP_SHORT_NAME, LOGO } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${APP_NAME} | Field Operations`,
  description: "Enterprise Last-Mile Delivery Run-Sheet & Digital e-POD Platform",
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
  themeColor: "#090d16",
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
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: swRegisterScript }}
        />
      </head>
      <body className="min-h-screen safe-top safe-bottom bg-[var(--bg)] antialiased select-none">
        {children}
      </body>
    </html>
  );
}

