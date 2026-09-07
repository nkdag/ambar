import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AMBAR — Personal archive",
    short_name: "AMBAR",
    description: "A calm, local-first personal archive.",
    start_url: `${siteUrl.pathname}/`,
    scope: `${siteUrl.pathname}/`,
    display: "standalone",
    background_color: "#f4f4f2",
    theme_color: "#111827",
    icons: [
      { src: `${siteUrl.pathname}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${siteUrl.pathname}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
