import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";
import { getConfig } from "@/lib/config";
import { basePath, pwaUrl } from "@/lib/paths";

const config = getConfig();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Historical Event Viewer",
  description:
    "Explore historical events in an interactive vertical timeline",
  manifest: `${basePath}/manifest.json`,

  icons: {
    icon: [{ url: `${basePath}/favicon.ico` }],
    apple: [{ url: pwaUrl("apple-touch-icon.png") }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HistoryViewer",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Historical Event Viewer",
    title: "Historical Event Viewer",
    description:
      "Explore historical events in an interactive vertical timeline",
  },
  twitter: {
    card: "summary",
    title: "Historical Event Viewer",
    description:
      "Explore historical events in an interactive vertical timeline",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang={config.defaultLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider config={config}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
