import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/privacy/page";
import TermsPage, { metadata as termsMetadata } from "@/app/terms/page";

describe("AMBAR launch information pages", () => {
  it("states the local-only privacy contract without inventing tracking", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByText(/stored in this browser on this device/i)).toBeInTheDocument();
    expect(screen.getByText(/does not use analytics, advertising trackers, or cookies/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^← Back to AMBAR$/i })).toHaveAttribute("href", "/");
  });

  it("sets honest prototype terms and excludes unsupported services", () => {
    render(<TermsPage />);

    expect(screen.getByRole("heading", { name: "Terms" })).toBeInTheDocument();
    expect(screen.getByText(/single-device local prototype/i)).toBeInTheDocument();
    expect(screen.getByText(/does not provide cloud sync, accounts, notifications, or guaranteed price alerts/i)).toBeInTheDocument();
  });

  it("publishes a self-referencing canonical URL for each legal route", () => {
    expect(privacyMetadata.alternates?.canonical).toBe("https://nkdag.github.io/ambar/privacy/");
    expect(termsMetadata.alternates?.canonical).toBe("https://nkdag.github.io/ambar/terms/");
  });
});
