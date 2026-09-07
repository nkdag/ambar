import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/privacy/", "/terms/"] as const;
  return routes.map((route) => ({
    url: `${siteUrl.href}${route}`,
    changeFrequency: route === "/" ? "weekly" : "yearly",
    priority: route === "/" ? 1 : 0.3,
  }));
}
