import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { CookieBanner } from "@/components/Cookie";
import { getSite } from "@/lib/site";
import { SITE_URL } from "@/lib/routes";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--f-archivo", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LE.DI.CA. — Sistemi di saldatura automatica per tubi", template: "%s | LE.DI.CA." },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#14171a", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const lang = h.get("x-lang") === "en" ? "en" : "it";
  const site = getSite();
  const admin = h.get("x-admin") === "1";
  return (
    <html lang={lang} className={`${archivo.variable} ${mono.variable}`} suppressHydrationWarning /* data-intro-pending impostato prima dell'idratazione dall'intro della home */>
      <body>
        {children}
        {!admin && <CookieBanner lang={lang} ga4={site.tracking?.ga4 ?? ""} />}
      </body>
    </html>
  );
}
