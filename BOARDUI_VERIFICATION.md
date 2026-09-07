# BoardUI Control Room — second showcase pass

Verified on 2026-09-06, on the existing `feat/boardui-redesign` working tree. This record supersedes the first-pass counts below.

- `npm test`: **80 tests in 9 files passed**. Overview/default/mobile navigation, collection filtering, product selection, keyboard-readable observations, activity range, personal-vault isolation, UTC date normalization and zero-price baselines were added with RED → GREEN evidence in `artifacts/boardui/overview*-red.log`.
- `npm run lint`, `npm run build`, `npm audit`, `git diff --check`: exit 0; **0 vulnerabilities**. Production output is the local static `out/` export.
- Built app served on **http://localhost:8011**. Extended `scripts/verify-browser.mjs` passed **1440 / 834 / 390** using cached Chromium **149.0.7827.55**. Overview/light/dark, readable chart tables, keyboard range/product selection, chart-label bounds, collection filters, four archive views, state previews and existing save/import/target/recovery flows passed. Every captured state passed axe WCAG A/AA scans. Console/page errors and unexpected external requests: **0**.
- Final screenshots: `artifacts/boardui/{1440,834,390}-overview-{light,dark}.png`; mobile viewport: `390-overview-viewport.png`; expanded price tables: `{width}-overview-price-data.png`. First-pass showcase captures are retained separately as `*-overview-first-pass.png`. Visual iteration strengthened statistic typography/semantic icon colors and aligned chart/reading/watch surfaces.
- Four additional source-owned Free/MIT blocks: **StatCards, RevenueChartCard, OrdersChartCard, ImportantAlertsCard**. All **25** original/installed provenance hash pairs verified, with the exact pilot MIT license retained. Recharts 3.9.2 renders charts; the app continues using `cx()` exclusively (clsx remains a transitive React Aria/Recharts dependency, not an application styling API).
- Independent final review verified source/license hashes, untouched domain/vault/parser/fixtures, fixed data edge cases, and rendered layouts. Root was the sole implementation writer.
- Caveats: synthetic price observations have no dates; activity is UTC and anchored to latest save. Desktop Chromium viewport emulation was tested; Safari/Firefox, physical touch devices and screen readers were not. Mobile intentionally stacks the dashboard into a longer page; fixed bottom navigation stays available.

## First migration pass — historical evidence


Completed in the canonical checkout `/Users/kaandaglioglu/Projects/Apps/Ambar`, on `feat/boardui-redesign`. BoardUI free/MIT is now the complete frontend language. The writer alone edited files; separate source/license, final-code and visual reviewers inspected the work read-only. Final code review found no remaining blocker.

## Result and scope

The shell, desktop/tablet/mobile navigation, search, quick save, import preview, all four archive views, detail/price target, state previews, Agent Access boundary and notifications use one BoardUI semantic system. Source-owned components, composite typography, spacing/radii, Remix icons and React Aria replace the former bespoke/beUI layer. AMBAR branding/copy, information architecture, detached import preview and honest single-device Local Vault remain intact.

All five original test files are byte-for-byte unchanged. Domain code and fixtures are also unchanged. Initial baseline: 62 tests in 5 files passed. Final: 73 tests in 7 files passed. The checkout began with unrelated lockfile edits for fast-uri and qs. Those edits were not manually reset; npm subsequently pruned both packages when their obsolete parent dependencies were removed.

## Final quality gates

Run in this order, from the canonical checkout, after the final application-code change:

| Command | Exact outcome |
| --- | --- |
| `npm test` | Exit 0; **7 test files passed, 73 tests passed**; Vitest 4.1.10; duration 2.50s |
| `npm run lint` | Exit 0; ESLint completed with **0 errors, 0 warnings** |
| `npm run build` | Exit 0; Next.js 16.3.1 compiled, TypeScript passed, static generation completed **4/4**; exported `/` and `/_not-found` |
| `npm audit` | Exit 0; **found 0 vulnerabilities** |
| `npm run test:browser` | Exit 0 against the built export; Chromium **149.0.7827.55**; **1440, 834 and 390 all passed**, browser errors `[]` |
| `git diff --check` | Exit 0; no whitespace errors |
| Source provenance validation | All **21** original and installed SHA-256 pairs match their files |
| Legacy import scan | No remaining Base UI, lucide, old motion/UI utilities, clsx or CVA imports in `src/` or direct dependencies |

The production export is served locally at **http://localhost:56635** using `npm start -- 56635`. The script now serves the configured static export with Python 3: `next start` is incompatible with the existing `output: "export"` setting. No deployment occurred.

Browser command used the already installed Chromium executable, without downloading a browser:

```bash
AMBAR_QA_URL=http://localhost:56635 \
AMBAR_BROWSER_EXECUTABLE='/Users/kaandaglioglu/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell' \
npm run test:browser
```

## Live browser evidence

The repeatable script is [scripts/verify-browser.mjs](./scripts/verify-browser.mjs). It creates isolated browser contexts with synthetic records, never a personal browser profile or private export. Every width was tested with reduced motion requested.

- Main route returned HTTP 200; example records remained unsaved; development state controls were absent in production.
- Computed BoardUI background `#f7f7f7`, body type `.875rem`, control radius `10px`, and actual archive-row grid layout were verified.
- List/card/gallery/table views passed, including the mobile table-to-list fallback. Both themes were exercised; dark list was captured.
- Search filtering/no-match, Enter-to-detail, tabs, numeric price history, modal focus containment and Escape/focus restoration passed. Compact menu-to-import restored focus to the menu trigger.
- Actual Link and Title input targets measured at least 44px on tablet/mobile. Invalid target input retained its focus ring and error state before correction.
- Product quick save survived reload. A target of exactly $12.50 and alert preference survived reload. Normalized duplicate saves were refused.
- Safe demo import produced a detached preview without writing the vault. Agent Access stayed explicitly unavailable.
- Long titles, notes and collection names fit every view and the detail panel without page-level horizontal overflow.
- Corrupt vault data was not overwritten at boot; explicit recovery produced a usable empty personal vault that survived reload.
- A loaded page saved locally while offline. An injected local-storage write exception produced visible retry feedback; restoring storage and retrying preserved prior records.
- **45 screenshots** (15 per width) were scanned using axe WCAG 2 A/AA and 2.1 AA tags with **0 violations**. No page errors or console errors occurred.

Evidence: [machine-readable results](./artifacts/boardui/results.json), [desktop](./artifacts/boardui/1440-list-light.png), [tablet](./artifacts/boardui/834-list-light.png), [mobile](./artifacts/boardui/390-list-light.png), [mobile save](./artifacts/boardui/390-quick-save.png), [invalid target focus](./artifacts/boardui/390-invalid-target-focus.png). Generated artifacts are intentionally ignored by Git.

Independent visual review covered views/themes, search/save/import/history, long content, empty and recovery states at all three widths. It found no remaining layout/clipping blocker. Four measured contrast corrections were made at the semantic token layer: dark rose text 8.49:1, chart stroke 5.36:1, ghost-button label 5.70:1, focus ring 4.70–5.03:1.

## RED → GREEN evidence

Intentional user-visible improvements were preceded by focused expected failures:

1. Compact library menu was missing; failing test preceded a menu exposing sections, collections, import and Agent Access.
2. A real empty personal vault after reload had no actionable state; failing test preceded the empty-shelf prompt.
3. A rejected bookmark file read lacked recovery; failing test preceded readable failure copy and retry selection.
4. Search had no named close action; failing test preceded `Close search`.
5. Invalid inputs lost their focus ring; a real-focus test failed before removing the invalid-state exclusion, then passed.
6. Compact actual input targets measured 20px despite a 44px styling intention; the browser assertion failed at 834px before adding a stable shell hook and actual-input minimum height, then passed at both compact widths.

Additional preservation coverage exercises product-kind selection, exact target cents and alert persistence, safe import non-writing, and all four development previews. No original test was rewritten to accept changed behavior.

## Installed free components and adaptations

Copied from the explicitly supplied local free/MIT reference, not from Pro or a global MCP. [BOARDUI_SOURCE.json](./src/styles/BOARDUI_SOURCE.json) records original and installed hashes.

- Button, IconButton, CloseButton.
- Input / InputBase / TextField, Label, HintText.
- Select / SelectItem, menu styles, chevrons and outside-press helper.
- SegmentedControl, Switch, Badge, Chip, StatusDot, Tooltip.
- Table and Notification.
- Exact semantic theme, composite typography and typography-aware `cx` utility.

Input and Select have narrow accessible-name/focus/touch adaptations. Table retains native caption/cell-button semantics while adopting the BoardUI surface; no sortable/selectable data grid or pagination was added. Notification retains its BoardUI recipe and the 4.2-second feedback lifetime, without unused avatar/actions or animation dependencies. Modal, tabs, navigation and theme control are AMBAR compositions using React Aria and installed primitives. The AMBAR accent and verified contrast overrides are isolated in `ambar-theme.css`.

Added runtime packages: `@remixicon/react` ^4.9.0, `react-aria-components` ^1.17.0. Added development QA packages: `@playwright/test` ^1.63.0, `@axe-core/playwright` ^4.13.0. No paid dependency/service was used.

Removed direct packages: `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `shadcn`, `tw-animate-css`, `motion`. No obsolete imports remained before removal. Old motion components, UI button, animation/class helpers and shadcn/beUI registry configuration are deleted; their exact paths appear below. Historical beUI attribution remains in THIRD_PARTY_NOTICES.md, alongside the full new BoardUI MIT license.

## Remaining limits

This is still a single-device local prototype: no backend/auth/cloud/AI/scraping, price polling, delivered alerts or functioning agent connection. Import remains preview-only. Theme and unsaved dialog drafts remain session state. Writes depend on Web Locks support. Offline verification covers saving an already loaded page, not service-worker installation or offline reload. Browser QA used cached desktop Chromium, with viewport emulation; Safari, Firefox, physical touch devices and screen readers were not exercised. Automated axe and keyboard checks are evidence, not a claim of exhaustive WCAG conformance.

No commit, push, deploy, publish, account creation, BoardUI Pro activation, paid-service use, secret addition, global BoardUI MCP configuration or external messaging occurred.

## Complete changed-file inventory

Status is relative to the current branch HEAD; the pre-existing lockfile state and subsequent pruning are described above.

| File | Change |
| --- | --- |
| [.gitignore](./.gitignore) | Modified |
| [AGENTS.md](./AGENTS.md) | Modified |
| [BOARDUI_VERIFICATION.md](./BOARDUI_VERIFICATION.md) | Added |
| [DESIGN.md](./DESIGN.md) | Modified |
| [README.md](./README.md) | Modified |
| [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) | Modified |
| `components.json` | Deleted |
| [licenses/BoardUI-MIT.txt](./licenses/BoardUI-MIT.txt) | Added |
| [package-lock.json](./package-lock.json) | Modified |
| [package.json](./package.json) | Modified |
| [scripts/verify-browser.mjs](./scripts/verify-browser.mjs) | Added |
| [src/app/globals.css](./src/app/globals.css) | Modified |
| [src/app/layout.tsx](./src/app/layout.tsx) | Modified |
| [src/components/ambar-app.tsx](./src/components/ambar-app.tsx) | Modified |
| [src/components/application/archive-dialogs.tsx](./src/components/application/archive-dialogs.tsx) | Added |
| [src/components/application/archive-navigation.tsx](./src/components/application/archive-navigation.tsx) | Added |
| [src/components/application/archive-notifications.tsx](./src/components/application/archive-notifications.tsx) | Added |
| [src/components/application/archive-overlays.tsx](./src/components/application/archive-overlays.tsx) | Added |
| [src/components/archive-items.tsx](./src/components/archive-items.tsx) | Modified |
| [src/components/base/badges/badge.tsx](./src/components/base/badges/badge.tsx) | Added |
| [src/components/base/badges/chip.tsx](./src/components/base/badges/chip.tsx) | Added |
| [src/components/base/badges/status-dot.tsx](./src/components/base/badges/status-dot.tsx) | Added |
| [src/components/base/buttons/button.tsx](./src/components/base/buttons/button.tsx) | Added |
| [src/components/base/buttons/close-button.tsx](./src/components/base/buttons/close-button.tsx) | Added |
| [src/components/base/buttons/icon-button.tsx](./src/components/base/buttons/icon-button.tsx) | Added |
| [src/components/base/dropdown/menu-styles.ts](./src/components/base/dropdown/menu-styles.ts) | Added |
| [src/components/base/input/hint-text.tsx](./src/components/base/input/hint-text.tsx) | Added |
| [src/components/base/input/input.test.tsx](./src/components/base/input/input.test.tsx) | Added |
| [src/components/base/input/input.tsx](./src/components/base/input/input.tsx) | Added |
| [src/components/base/input/label.tsx](./src/components/base/input/label.tsx) | Added |
| [src/components/base/notification/notification.tsx](./src/components/base/notification/notification.tsx) | Added |
| [src/components/base/segmented-control/segmented-control.tsx](./src/components/base/segmented-control/segmented-control.tsx) | Added |
| [src/components/base/select/select.tsx](./src/components/base/select/select.tsx) | Added |
| [src/components/base/switch/switch.tsx](./src/components/base/switch/switch.tsx) | Added |
| [src/components/base/table/table.tsx](./src/components/base/table/table.tsx) | Added |
| [src/components/base/tooltip/tooltip.tsx](./src/components/base/tooltip/tooltip.tsx) | Added |
| [src/components/boardui-migration.test.tsx](./src/components/boardui-migration.test.tsx) | Added |
| [src/components/foundations/icons/chevrons.tsx](./src/components/foundations/icons/chevrons.tsx) | Added |
| `src/components/motion/animated-toast-stack.tsx` | Deleted |
| `src/components/motion/drawer.tsx` | Deleted |
| `src/components/motion/morphing-modal.tsx` | Deleted |
| `src/components/motion/morphing-tabs.tsx` | Deleted |
| `src/components/ui/button.tsx` | Deleted |
| `src/lib/ease.ts` | Deleted |
| `src/lib/utils.ts` | Deleted |
| [src/styles/BOARDUI_SOURCE.json](./src/styles/BOARDUI_SOURCE.json) | Added |
| [src/styles/ambar-theme.css](./src/styles/ambar-theme.css) | Added |
| [src/styles/theme.css](./src/styles/theme.css) | Added |
| [src/styles/typography.css](./src/styles/typography.css) | Added |
| [src/utils/cx.ts](./src/utils/cx.ts) | Added |
| [src/utils/use-dismiss-on-outside-press.ts](./src/utils/use-dismiss-on-outside-press.ts) | Added |
