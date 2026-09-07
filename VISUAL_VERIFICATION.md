# AMBAR — $0 visual enhancement verification

Implemented on the existing `feat/boardui-redesign` branch and dirty working tree. The root agent was the only implementation writer. A separate read-only agent reviewed the final source against the starting-tree snapshot, including preservation of the BoardUI migration. No reset/discard, commit, push, deployment, purchase, account creation, paid API or paid credit use occurred.

## Result and tooling

The Overview has a compact editorial shelf composition: a local contour texture, layered archive leaves, restrained amber/blue atmosphere and a keyboard/pointer brand fan response. Four stat cards animate changes to their counts while assistive technology receives the final value immediately. Only the hero and reading panel receive pointer light. A coordinated entrance and view transitions preserve the same DOM/focus ownership; there is no stagger sequence or artificial loading delay. Existing Local Vault, charts, navigation, labels, errors and actions remain intact.

| Tool | Decision |
| --- | --- |
| `motion@13.2.0` | Retained, exactly pinned, MIT. Springs plus `motion/react-mini` for short view transitions. Lockfile resolves framer-motion/motion-dom 13.2.0 and motion-utils 13.0.0. |
| Motion Primitives AnimatedNumber + Spotlight | Both adapted from commit `92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d`; MIT. BoardUI semantic colors and `cx()`, no raw zinc or `cn`. |
| `@paper-design/shaders-react@0.0.80` | Rejected before installation; no package/source distributed. Exact upstream source exposes uncaught asynchronous WebGL initialization failure and no context-loss recovery, with default minimum pixel ratio 2. Additional guards and GPU work offer little value for this soft field. This is a source-based integration decision, not a measured GPU benchmark. CSS/SVG supplies the atmosphere instead. |
| Local SVG | Original deterministic `src/assets/ambar-shelf-contours.svg`, 1,112 bytes. Not a Haikei export. |
| Type/icons | Existing local Inter, JetBrains Mono and Remix Icons retained. |

References: [Motion bundle guidance](https://motion.dev/docs/react-reduce-bundle-size), [exact Paper React package metadata](https://registry.npmjs.org/@paper-design/shaders-react/0.0.80), [Paper upstream source](https://github.com/paper-design/shaders). No React Bits, Spline, Rive, GSAP, Aceternity, Magic UI, hosted embeds or runtime remote resources were added.

## Behavioral evidence

Focused RED/GREEN evidence is stored in `artifacts/visual-lab/evidence/`:

- `red-visual-contracts.log` → `green-visual-contracts.log`: SSR numeric content, static reduced values, live preference changes, decorative semantics, touch exclusion, canvas-independent hero action and focus-preserving view changes.
- `red-number-update.log` → `green-number-update.log`: prevents a one-frame destination flash before the number spring advances. This issue was also identified by independent review and fixed before final verification.
- `red-browser-contracts.log`: the new visual contract fails against the untouched pre-enhancement static build. `browser.log` records final passing visual and full Local Vault suites.

The browser checks mounted statistic updates from a synthetic storage event. Normal motion must contain intermediate visual values while the accessible value is already final; reduced motion must have no intermediate visual values once React commits the update. All four final numeric values are asserted. The active Overview spotlight is removed when reduced motion is enabled live, and restored when allowed again.

## Quality gates

Run sequentially: `npm test`, `npm run lint`, `npm run build`, `npm audit`, `git diff --check`, then the localhost static build and `npm run test:browser`.

- Vitest: **167 tests, 19 files passed**. Existing assertions were preserved.
- ESLint, TypeScript/production static build, and diff whitespace checks: **passed**.
- npm audit: **0 vulnerabilities** at verification time.
- Chromium **149.0.7827.55**: **1440, 834, 390 px passed**.
- Visual matrix: both light/dark themes × reduced/normal motion × all three widths. 12 full-page images plus 4 mobile viewport images.
- **0 external requests, 0 console/page/hydration errors, 0 horizontal overflows, 0 axe WCAG A/AA violations** in the tested states. Focus indicators, view-switch focus and current Local Vault keyboard/dialog focus-return checks passed.
- The app boots and remains interactive with canvas context acquisition returning `null`; no app canvas requests are made. Axe alone temporarily receives its own private 2D canvas for complete text/color analysis. WebGL stays unavailable throughout.
- Existing full browser suite passed: overview charts/selectors/data tables, all archive layouts and state previews, import safety, search/dialog focus, save/reload, target/reload, duplicates, long content, recovery/reload, offline save and retryable write failures.

Static server: `http://localhost:8765`, started with `npm start -- 8765`. This serves `out/` locally and is not a deployment.

## Build byte comparison

Same production-build command and environment, measured before dependency/source changes and after implementation. Exact per-chunk records: `artifacts/visual-lab/evidence/build-before.json` and `build-after.json`.

| `out/_next/static/chunks/` | Before | After | Delta |
| --- | ---: | ---: | ---: |
| JavaScript, raw | 1,286,918 B | 1,320,033 B | +33,115 B |
| CSS, raw | 184,049 B | 190,857 B | +6,808 B |
| **All chunks, raw** | **1,470,967 B** | **1,510,890 B** | **+39,923 B (+2.71%)** |
| JavaScript, gzip | 382,903 B | 394,354 B | +11,451 B |
| CSS, gzip | 25,003 B | 26,511 B | +1,508 B |
| **All chunks, gzip** | **407,906 B** | **420,865 B** | **+12,959 B (+3.18%)** |

The increase covers Motion springs/mini animation, the new components and semantic CSS. Gzip is the sum of independently compressed files at level 9 with deterministic timestamps; it is not a measured transfer from Python's uncompressed static server. Counts include all emitted JS/CSS chunks, not just the initially requested subset. The 1,112-byte SVG is outside this chunk total. Fonts are unchanged. No shader chunk exists.

## Accessibility and performance limits

Reduced motion is static during SSR/hydration and responds to live preference changes. Numbers show their real initial value; only subsequent updates tween. Decorative copies are `aria-hidden`, without live-region announcements. Pointer light requires fine hover input; touch has no hover dependency. Hero artwork is noninteractive; essential content and actions remain legible without any effect.

The desktop atmosphere runs once for 3 seconds; there is no endless animation. Compact layouts skip it. View transitions are 240 ms; pointer/number springs run only in response to input/data changes. Screenshots use fixed terminal animation states after exercising normal-motion interactions, with no randomness. GPU/frame-time/battery performance on physical devices was not benchmarked. Chromium automation does not replace Safari/Firefox or human screen-reader testing; those are residual coverage limits. No observed accessibility or performance blocker remains in the tested matrix.

## Changed files in this pass

Existing files modified (relative to the starting dirty tree):

- `package.json`, `package-lock.json`
- `src/app/globals.css`, `src/components/ambar-app.tsx`
- `src/components/application/archive-overview.tsx`, `src/components/application/dashboard/stat-cards.tsx`
- `src/styles/BOARDUI_SOURCE.json`
- `scripts/verify-browser.mjs`
- `README.md`, `THIRD_PARTY_NOTICES.md`

Added:

- `src/components/application/overview-hero.tsx`, `visual-transition.tsx`
- `src/components/base/animated-number/animated-number.tsx`, `src/components/base/spotlight/spotlight.tsx`
- `src/utils/use-visual-motion.ts`, `src/styles/visual-lab.css`
- `src/components/visual-enhancement.test.tsx`, `scripts/verify-visual.mjs`
- `src/assets/ambar-shelf-contours.svg`
- `src/styles/VISUAL_SOURCE.json`, `licenses/Motion-MIT.txt`, `licenses/Motion-Primitives-MIT.txt`
- This `VISUAL_VERIFICATION.md` report

Existing BoardUI licenses/notices and original provenance hashes are preserved; the stat-card installed hash reflects its narrow AnimatedNumber integration. `VISUAL_SOURCE.json` records the exact Motion Primitives commit, original paths/hashes, installed paths/hashes, license and SVG hash.

## Artifacts

- Final images and visual results: `artifacts/visual-lab/final/`
- Preserved original three baseline images: `artifacts/visual-lab/baseline/`
- Full Local Vault screenshots/results: `artifacts/boardui/`
- RED/GREEN, test/lint/build/audit/browser logs, per-chunk bytes, starting-tree snapshot and incremental changed-file list: `artifacts/visual-lab/evidence/`

All artifacts use disposable synthetic data. No credentials or private exports were read or included. Purchase/paid API/paid credits/commit/push/deploy counts: **0**.
