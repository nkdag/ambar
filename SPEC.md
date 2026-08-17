# AMBAR — v0 Specification

## Vertical slice
A responsive web prototype using realistic local demo data.

## Required surfaces
- Inbox, Products, Reading
- List, card, gallery, and compact table views
- Global search/filter command surface
- Quick-save modal
- Item detail drawer
- Product card/detail with current price, prior price, delta, 30-day sparkline, target, and alert state
- Chrome import preview flow using safe local parsing only
- Honest Agent Access settings preview labelled “coming next”; no fake connection
- Light/dark themes
- Empty, loading, error, and offline previews

## Acceptance criteria
1. Works without horizontal overflow at 1440, 834, and 390 CSS pixels.
2. Search matches title, site, tag, collection, and note with local data.
3. `⌘K`/`Ctrl+K` opens search; Escape closes modal/drawer; visible focus is preserved.
4. Quick-save creates a local in-memory item and confirms with a toast.
5. Selecting an item opens detail; target-price changes update that product immediately.
6. Each required view mode renders distinct, usable information density.
7. Product sparklines use real numeric demo arrays, not decorative placeholders.
8. Loading, empty, error, and offline states can be previewed deterministically.
9. Reduced-motion removes nonessential animation without breaking layout.
10. No purple gradient, glassmorphism, generic analytics dashboard, or AI action exists.
11. Tests cover filtering, quick save, target-price update, and Chrome bookmark parsing.
12. Lint, typecheck/tests, and production build pass; browser QA exercises core interactions.

## Out of scope
Persistence across reloads, real fetching, real import writes, auth, external APIs, alerts, scraping, MCP server, CLI publication.
