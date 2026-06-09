import "./globals.css";
import "./styles/markdown.css";
import "./styles/highlight.css";
import { getClientConfig } from "./config/client";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getServerSideConfig } from "./config/server";
import { AppProviders } from "./components/home";

export const metadata: Metadata = {
  title: "QuanAiChat",
  description: "quanquan.space 公益 GPT 服务",
  icons: {
    icon: "/quanai.png",
    shortcut: "/quanai.png",
    apple: "/quanai.png",
  },
  appleWebApp: {
    title: "QuanAiChat",
    statusBarStyle: "default",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f4f2" },
    { media: "(prefers-color-scheme: dark)", color: "#141b19" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverConfig = getServerSideConfig();

  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <meta
          name="server-config"
          content={JSON.stringify({
            enabledProviders: serverConfig.enabledProviders,
            summaryModel: serverConfig.summaryModel,
          })}
        />
        <Script src="/serviceWorkerRegister.js" strategy="beforeInteractive" />
        <Script
          src="https://analytics.qqs.tw/script.js"
          strategy="afterInteractive"
          data-website-id="6ac8e216-95c3-495d-8974-ad467b2c7fed"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
