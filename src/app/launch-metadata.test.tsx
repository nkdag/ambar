import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import NotFound from "@/app/not-found";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteMetadata, siteUrl } from "@/lib/site-metadata";

describe("AMBAR launch metadata", () => {
  it("publishes complete search and social metadata", () => {
    expect(siteUrl.origin).toBe("https://nkdag.github.io");
    expect(siteUrl.pathname).toBe("/ambar");
    expect(siteMetadata.title).toEqual({
      default: "AMBAR — Your personal archive",
      template: "%s · AMBAR",
    });
    expect(siteMetadata.description).toMatch(/local-first personal archive/i);
    expect(siteMetadata.manifest).toBe("https://nkdag.github.io/ambar/manifest.webmanifest");
    expect(siteMetadata.openGraph).toMatchObject({
      type: "website",
      siteName: "AMBAR",
      images: [{ url: "https://nkdag.github.io/ambar/og-image.png", width: 1200, height: 630 }],
    });
    expect(siteMetadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("exposes crawl and install resources for every public route", () => {
    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://nkdag.github.io/ambar/sitemap.xml",
    });
    expect(sitemap().map(({ url }) => url)).toEqual([
      "https://nkdag.github.io/ambar/",
      "https://nkdag.github.io/ambar/privacy/",
      "https://nkdag.github.io/ambar/terms/",
    ]);
    expect(manifest()).toMatchObject({
      name: "AMBAR — Personal archive",
      short_name: "AMBAR",
      start_url: "/ambar/",
      display: "standalone",
    });
  });

  it("renders a useful custom not-found page", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: /nothing stored here/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to ambar/i })).toHaveAttribute("href", "/");
  });
});
