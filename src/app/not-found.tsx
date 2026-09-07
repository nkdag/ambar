import { LegalPage } from "@/components/application/legal-page";

export default function NotFound() {
  return (
    <LegalPage title="Nothing stored here" eyebrow="404" backLabel="Return to AMBAR">
      <section>
        <h2>This shelf is empty</h2>
        <p>The page may have moved, or the address may be incomplete. Your local vault has not been changed.</p>
      </section>
    </LegalPage>
  );
}
