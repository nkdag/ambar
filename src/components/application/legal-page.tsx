import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  eyebrow,
  backLabel = "Back to AMBAR",
  children,
}: {
  title: string;
  eyebrow: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link className="legal-brand" href="/" aria-label="Back to AMBAR">
          <span aria-hidden>▣</span>
          AMBAR
        </Link>
        <header>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <p>Last updated September 7, 2026</p>
        </header>
        <div className="legal-copy">{children}</div>
        <Link className="legal-back" href="/">← {backLabel}</Link>
      </div>
    </main>
  );
}
