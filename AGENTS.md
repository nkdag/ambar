# AMBAR — Project Rules

## Product
AMBAR is a calm, living personal archive with product price tracking and future agent access. It is personal-first and public-ready, but v0 is an interactive local-data prototype.

## Commands
- `npm run dev`
- `npm test`
- `npm run lint`
- `npm run build`

## Safety and scope
- Do not add generative AI, embeddings, semantic search, authentication, scraping, social OAuth, payments, or production data in v0.
- Do not commit, push, deploy, publish, or spend credits without Kaan's explicit approval.
- Never use real credentials or private bookmark exports in fixtures.
- External HTML is untrusted and must never execute on the app origin.

## Engineering
- Strict RED → GREEN → REFACTOR for behavioral work.
- One writer per file/module at a time; independent reviewer must inspect the final diff.
- TypeScript strict; accessible semantic HTML; keyboard support; reduced-motion support.
- beUI is used selectively as owned source, not as a visual identity or closed dependency.
- Completion requires tests, lint, production build, and browser QA at 1440, 834, and 390 widths.
