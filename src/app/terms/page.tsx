import type { Metadata } from "next";
import { LegalPage } from "@/components/application/legal-page";
import { siteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the AMBAR local prototype.",
  alternates: { canonical: `${siteUrl.href}/terms/` },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" eyebrow="Prototype terms">
      <section>
        <h2>Current product</h2>
        <p>
          AMBAR is a single-device local prototype provided for evaluation. It does not provide cloud sync, accounts, notifications, or guaranteed price alerts.
        </p>
      </section>
      <section>
        <h2>Your data and backups</h2>
        <p>
          You control the links and notes you save. Browser storage can be cleared or become unavailable, so do not treat this prototype as the only copy of important information.
        </p>
      </section>
      <section>
        <h2>Prices and external content</h2>
        <p>
          Example prices and histories are demonstration data, not financial or purchasing advice. External sites control their own content, availability, and terms.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not use AMBAR to store or share content you do not have the right to use, or to violate another service&apos;s rules.
        </p>
      </section>
    </LegalPage>
  );
}
