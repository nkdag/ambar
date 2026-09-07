# AMBAR

**AMBAR Control Room** is a local-first personal archive built with source-owned **BoardUI Free/MIT** components, React Aria, Remix icons, and synthetic example data. BoardUI is AMBAR's interface language; AMBAR is the product.

## What works locally

- **Overview is the landing view:** four computed stat cards, selectable product-price history, 7/14-day archive activity, reading queue, price-watch feed, collection filters and recent saves.
- Price observations have no invented dates. Activity uses UTC save dates and ends at the latest save. Both lightweight native-SVG visualizations have readable data tables; price observations also have a keyboard slider. Charts use no JS animation.

- A fresh browser sees a labelled example archive that is never saved as personal data.
- The first personal quick save creates a versioned local vault; later saves and product targets survive reloads. Web Locks serialize writes; normalized duplicate URLs open the existing record.
- Search, list/card/gallery/table views, item details, light/dark themes and responsive navigation are interactive.
- Chrome HTML import is a safe, detached preview. It does not write imported bookmarks.
- Price histories are sample data; targets are saved locally. No price polling or notification delivery exists.
- No account, cloud sync, scraping, social API, AI, CLI or MCP connection is active. Agent Access is an honest “coming next” preview.

## Run

Requirements: Node.js 20+, npm; Python 3 for serving the static production export. Use a browser with Web Locks on localhost for Local Vault writes.

```bash
npm install
npm run dev
```

Development: [localhost:3000](http://localhost:3000). Use `localhost` for Next.js development hydration. The secondary “Demo states” disclosure in Inbox, Products and Reading covers loading, empty, error and offline states in both development and the built showcase.

## Quality gates and production preview

Run in order:

```bash
npm test
npm run lint
npm run build
npm run verify:launch
npm audit
npm start -- 8000
```

`next.config.ts` uses `output: "export"`; `npm start` serves `out/` on localhost with Python, rather than calling the incompatible `next start`. Change `8000` to any free port. The built app is at [localhost:8000](http://localhost:8000). Serving this local artifact does not deploy it.

For browser QA, install Playwright Chromium locally if needed (`npx playwright install chromium`), or supply an existing compatible Chromium executable:

```bash
AMBAR_QA_URL=http://localhost:8000 npm run test:browser
# Optional: AMBAR_BROWSER_EXECUTABLE=/absolute/path/to/chromium
# Example cache path (version changes with Playwright):
# ~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell
```

The browser script uses isolated synthetic storage at 1440, 834 and 390 widths. It verifies Overview navigation, computed metrics, chart data/labels, keyboard observation selection, collection filters, state previews, all archive views, light/dark, real token/grid layout, keyboard/focus, 44px compact input targets, invalid-target focus, safe import, save/target reload persistence, duplicates, long content, corrupt recovery, retryable write failures, saving while the already loaded page is offline, and the Privacy, Terms, and custom 404 surfaces. Every captured state is scanned with axe for WCAG A/AA issues. Screenshots and results go to ignored `artifacts/boardui/`. No private exports or personal browser profile are used. `npm test` remains the fast Vitest suite.

## Launch readiness

- Privacy and Terms are linked from the application and state the honest local-only contract.
- Canonical metadata, Open Graph/Twitter preview, branded icons, web manifest, `robots.txt`, `sitemap.xml`, and a custom 404 are generated in the static export.
- `npm run verify:launch` checks required routes/assets, internal links, social metadata, secret-like values, and a 500 KB gzip first-load budget.
- GitHub Pages redirects HTTP to HTTPS and currently returns HSTS. HTTPS enforcement remains a hosting responsibility, not a client-side redirect.
- AMBAR currently uses no cookies, analytics, advertising trackers, backend-submitted forms, or public comment surface. A consent banner and spam protection would be misleading and are intentionally absent until one of those capabilities exists.

## BoardUI ownership

- Free application blocks: StatCards, RevenueChartCard, OrdersChartCard and ImportantAlertsCard, adapted from the pilot to archive data. Charts use owned native SVG; the visual enhancement adds pinned MIT `motion@13.2.0`.
- Free base components: `src/components/base/`; AMBAR compositions: `src/components/application/`.
- Foundations: `src/styles/theme.css`, `typography.css`; scoped AMBAR token customization: `ambar-theme.css`.
- Merge classes with `src/utils/cx.ts`, which understands BoardUI composite type utilities.
- [DESIGN.md](./DESIGN.md) records approved design progression, component adaptations and responsive/accessibility contracts.
- [Source provenance](./src/styles/BOARDUI_SOURCE.json), [BoardUI MIT license](./licenses/BoardUI-MIT.txt), and [third-party notices](./THIRD_PARTY_NOTICES.md) must remain with source distributions.
- Only needed free source was copied from `../_spikes/boardui-free-pilot`. No CLI telemetry, Pro activation, global MCP configuration, demo branding, AI dependency or paid service is used.

## Product contracts

[PRODUCT.md](./PRODUCT.md) · [SPEC.md](./SPEC.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [AGENTS.md](./AGENTS.md) · [Verification evidence](./BOARDUI_VERIFICATION.md)

The next cloud slice would require real backend ownership, RLS, export and deletion. It is not represented as working here. Theme choice and in-progress dialog drafts remain session state; personal records and product targets are the persistent slice.

## Local visual study

The Overview shelf composition uses an original local SVG texture, semantic amber/blue CSS atmosphere, Motion Primitives derived count transitions and pointer light on the hero and reading panel. The hero fan responds to pointer or keyboard focus. Motion is finite, with no random timing; compact layouts skip the atmospheric entrance. Live reduced-motion changes disable number tweens, pointer light and transitions. Paper Shaders was evaluated and rejected before installation; no canvas/GPU fallback dependency or external runtime asset is required.

`npm run test:browser` also verifies the visual layer in both themes at 1440/834/390px, reduced and normal motion, with canvas disabled. Final screenshots and machine-readable browser results are under `artifacts/visual-lab/final/`; existing `artifacts/visual-lab/baseline/` is preserved. Normal-motion screenshots capture the deterministic terminal state after exercising interactions. See [VISUAL_VERIFICATION.md](./VISUAL_VERIFICATION.md) for bytes, evidence and limitations.
