# AMBAR — Local Vault Specification

## Vertical slice
A responsive single-device personal archive whose quick saves and product targets persist across reloads in a versioned local vault.

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
2. Search matches URL, title, site, tag, collection, and note with local data.
3. `⌘K`/`Ctrl+K` opens search; Escape closes modal/drawer; visible focus is preserved.
4. Quick-save validates and normalizes a web URL, writes the item to the local vault, and confirms the actual write outcome.
5. Selecting an item opens detail; target-price changes update and persist that product immediately.
6. Each required view mode renders distinct, usable information density.
7. Product sparklines use real numeric demo arrays, not decorative placeholders.
8. Loading, empty, error, and offline states can be previewed deterministically.
9. Reduced-motion removes nonessential animation without breaking layout.
10. No purple gradient, glassmorphism, generic analytics dashboard, or AI action exists.
11. Tests cover filtering, quick save, target-price update, Chrome bookmark parsing, vault serialization, corrupt/unsupported payload recovery, and reload persistence.
12. First load without a vault shows a clearly labelled, unsaved example archive; the first personal save creates a vault containing only user-created data.
13. Storage writes happen only after explicit user mutations or recovery, so existing data is never overwritten during boot.
14. The same normalized URL—ignoring fragments, common tracking parameters, query ordering, default ports, and trailing slashes—is not added twice.
15. Storage write failures leave the in-memory session usable and expose an honest local-save warning.
16. Lint, typecheck/tests, and production build pass; browser QA exercises example → save → reload → recover at 1440, 834, and 390 widths.
17. Privacy and Terms are reachable from application navigation and describe the actual local-only data behavior without implying cookies, analytics, accounts, or cloud sync.
18. The static export includes canonical title/description metadata, Open Graph and Twitter preview metadata, branded favicon/PWA images, a web manifest, `robots.txt`, `sitemap.xml`, and a custom 404 page.
19. Internal links resolve in both local static-server and GitHub Pages `/ambar` builds; both outputs pass the launch verifier.
20. Launch verification scans generated text assets for secret-like credential values and enforces a 500 KB gzip first-load budget.
21. GitHub Pages must redirect HTTP to HTTPS. A client-side redirect is not a substitute for host-level enforcement.
22. Cookie consent, analytics, and spam protection remain absent while AMBAR has no cookies, tracking, or backend-submitted public forms; adding any such capability requires revisiting this contract.

## Out of scope
Real fetching, Chrome import writes, real auth/cloud sync, external APIs, notifications, scraping, MCP server, CLI publication.
