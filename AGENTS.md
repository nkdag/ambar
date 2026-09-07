# AMBAR — Project Rules

## Product
AMBAR is a calm, living personal archive with product price tracking and future agent access. It is personal-first and public-ready, but v0 is an interactive local-data prototype.

## Commands
- `npm run dev`
- `npm test`
- `npm run lint`
- `npm run build`
- `npm audit`
- `npm start -- <port>` (Python 3 serves the static `out/` build on localhost)
- `npm run test:browser` (see README for the local browser path)

## Safety and scope
- Current approved slice is honest single-device Local Vault persistence. Real authentication/cloud sync may be designed, but must not be represented as working until a real backend, RLS, export, and deletion path exist.
- Do not add generative AI, embeddings, semantic search, scraping, social OAuth, payments, or production data in this slice.
- Do not commit, push, deploy, publish, create paid cloud resources, or spend credits without Kaan's explicit approval.
- Never use real credentials or private bookmark exports in fixtures.
- External HTML is untrusted and must never execute on the app origin.

## Engineering
- Strict RED → GREEN → REFACTOR for behavioral work.
- One writer per file/module at a time; independent reviewer must inspect the final diff.
- TypeScript strict; accessible semantic HTML; keyboard support; reduced-motion support.
- BoardUI free/MIT is the approved canonical frontend language; use owned source under `src/components/base/`, semantic tokens, composite typography, Remix icons, React Aria, and `cx()` from `src/utils/cx.ts`.
- Preserve BoardUI source provenance/licenses. No Pro, global BoardUI MCP configuration, copied demo branding, or parallel legacy UI system.
- Completion requires tests, lint, production build, and browser QA at 1440, 834, and 390 widths.
