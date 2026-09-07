import type { Metadata } from "next";

const canonicalSite = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nkdag.github.io/ambar";

export const siteUrl = new URL(canonicalSite.replace(/\/$/, ""));
const assetUrl = (path: string) => `${siteUrl.href}${path}`;

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl.origin),
  applicationName: "AMBAR",
  title: {
    default: "AMBAR — Your personal archive",
    template: "%s · AMBAR",
  },
  description: "A calm, local-first personal archive for saved links, reading, collections, and product price watches.",
  alternates: { canonical: siteUrl.href },
  manifest: assetUrl("/manifest.webmanifest"),
  icons: {
    icon: [{ url: assetUrl("/icon.svg"), type: "image/svg+xml" }],
    apple: [{ url: assetUrl("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl.href,
    siteName: "AMBAR",
    title: "AMBAR — Your personal archive",
    description: "Save it once. Find it again. Keep your archive on your device.",
    images: [{ url: assetUrl("/og-image.png"), width: 1200, height: 630, alt: "AMBAR personal archive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMBAR — Your personal archive",
    description: "Save it once. Find it again. Keep your archive on your device.",
    images: [assetUrl("/og-image.png")],
  },
  robots: { index: true, follow: true },
};
