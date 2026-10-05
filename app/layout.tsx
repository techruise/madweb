import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { pageMetadata, siteUrl } from "@/lib/seo";
export const metadata: Metadata = {
  ...pageMetadata(
    "MAD | Property & Construction in Lahore",
    `${site.tagline} Property sale, purchase and construction in Johar Town and across Lahore. Established ${site.established}.`,
    "/",
  ),
  metadataBase: new URL(siteUrl),
  keywords: [
    "real estate Johar Town Lahore",
    "construction company Lahore",
    "buy property Lahore",
  ],
  applicationName: site.name,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          rel="preload"
          href="/fonts/font-2.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/font-4.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
