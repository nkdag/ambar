import type { Metadata } from "next";
import { LegalPage } from "@/components/application/legal-page";
import { siteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the AMBAR local prototype handles your data.",
  alternates: { canonical: `${siteUrl.href}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" eyebrow="Local-first by design">
      <section>
        <h2>What AMBAR stores</h2>
        <p>
          Items you save, notes, tags, collections, and product targets are stored in this browser on this device using browser storage.
        </p>
      </section>
      <section>
        <h2>What AMBAR does not collect</h2>
        <p>
          This prototype does not send your archive to an AMBAR server and does not use analytics, advertising trackers, or cookies.
        </p>
      </section>
      <section>
        <h2>Imports and external links</h2>
        <p>
          Chrome bookmark files are parsed locally for preview. Opening a saved link takes you to the external site, where that site&apos;s own privacy terms apply.
        </p>
      </section>
      <section>
        <h2>Your control</h2>
        <p>
          Clearing this site&apos;s browser data removes the local vault. Until export and cloud sync exist, you are responsible for preserving data you need.
        </p>
      </section>
    </LegalPage>
  );
}
