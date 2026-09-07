# AMBAR — BoardUI Control Room Showcase

Kaan approved **BoardUI free/MIT as the complete frontend design language** on 2026-09-06. This supersedes the former bespoke paper/Fraunces/beUI contract. AMBAR owns the installed source; no Pro component, account, paid service, global MCP configuration, or BoardUI demo branding is part of this migration.

## Current showcase pass

AMBAR is a realistic canvas for deciding whether BoardUI is worth buying. Visual and component evaluation takes priority; the existing local-vault behavior remains available for interaction testing. The default **Overview** combines four live statistics, a wide selectable price-history card, compact save-activity bars, reading/price-watch panels, eight fixture-derived collection shelves and recent items. “BoardUI Free playground” identifies the purpose discreetly.

The free pilot's **StatCards**, **RevenueChartCard**, **OrdersChartCard** and **ImportantAlertsCard** are copied source, adapted with recorded hashes. Price curves use sequential observations, a dashed target and a keyboard slider; activity uses 7/14 UTC days ending at the latest save. Expandable tables provide all chart values. No count-up hook or animation library is used. CSS hover/focus/active feedback respects reduced motion.

Light surfaces stay neutral; cyan/teal identifies price, blue activity, and lime/amber meaningful statuses. Inter composite typography, inset tiles, compact command controls and a persistent mobile Overview destination carry the BoardUI language. Tablet keeps two chart columns; phone stacks cards with bounded chart labels. Collections filter Inbox; reading and watch rows open the existing details. State previews remain available in the built showcase.

## Idea — inherited product truth

“Kaydettiğin her şey tekrar bulabildiğin, değişimini görebildiğin bir yerde yaşasın.” A calm personal archive for links, reading and products, with a visible path back to a source. Primary action: Quick save. The approved profile is a web Local Utility with a single-device Local Vault. PRODUCT.md, SPEC.md and ARCHITECTURE.md remain authoritative for behavior and boundaries.

This is a component and visual evaluation canvas. No backend, authentication, fetching, scraping, cloud sync, AI, semantic search, paid pricing service, or real notification delivery is introduced.

## User Flow — inherited and mapped

First 60 seconds: see a clearly labelled, unsaved example → Quick save → enter URL, optional title/note and kind → save under a Web Lock → see real success or retryable failure → reopen after reload. Only personal records enter the vault. Normalized duplicate URLs open the existing record.

| Existing flow | BoardUI composition | Alternate and recovery states |
| --- | --- | --- |
| Inbox / Products / Reading | Owned shell navigation, Badge counts, Remix icons | Genuine empty shelf offers Quick save; current section stays identified |
| Search, Cmd/Ctrl+K | React Aria modal, InputBase, SegmentedControl, existing combobox result model | Arrow navigation, Enter opens detail, no-match copy, Escape dismissal |
| Quick save / Alt+S | Button, Input/TextField/Label, Select, text-area composition | Native URL validation, disabled saving, actual write failure and retry |
| Four archive views | Source-owned rows/cards/gallery and BoardUI static Table surface | Full accessible title and price direction, mobile table becomes list |
| Detail / price target | React Aria side panel and tabs, BoardUI Input and Switch | Exact cent values, malformed input feedback, empty history, example target guard |
| Chrome import preview | Same modal and Button family, accessible native file chooser | Safe demo file, 2 MB limit, unreadable file recovery; no import writes |
| Local Vault | StatusDot, persistent inline notice, Notification | Booting, unsaved example, saved, corrupt/unsupported recovery, retryable write failure |
| Agent Access | Rounded panels and “Coming next” Chip | Explicitly unconnected; disabled action, no credential creation |

Loading/empty/error/offline previews remain inside the secondary “Demo states” disclosure, including in the built showcase. Local import HTML remains detached data and is never injected into the document.

## Wireframe — structural mapping

```text
Desktop 1440
┌ Library panel ┐ ┌ Workspace ──────────────────────────┐
│ AMBAR         │ │ Sections       Search / Theme / Save│
│ Quick save    │ ├─────────────────────────────────────┤
│ Overview      │ │ Compact example or recovery notice  │
│ Collections   │ │ Overview: stats / charts / activity │
│               │ │ Reading / price watch / recent      │
│ Import        │ │ Archive content                    │
│ Agent Access  │ │                                    │
│ Vault status  │ │ Local Vault footer                  │
└───────────────┘ └─────────────────────────────────────┘
                     Detail opens a contextual right panel

Tablet 834: menu + AMBAR + search/theme/save; local status line;
            menu sheet retains sections, collections, import and access.
Mobile 390: compact top bar; local status; single-column archive;
            bottom Overview / Inbox / Save / Products / Reading;
            menu sheet for collections, import and Agent Access; full-screen detail.
```

Content stays left aligned. Desktop shell: 240px navigation, 12px page inset/gutter, flexible min-width-zero workspace. Main content uses 32px padding (24px tablet, 16px mobile). Dialogs are bounded and internally scrollable; actions remain reachable on short screens. No clipping rule hides page overflow to make QA pass.

## First Draft — BoardUI baseline

Reference: the locally installed free pilot at `../_spikes/boardui-free-pilot`, specifically its semantic theme, composite type ramp, base components, floating sidebar shape and menu recipes. Its free dashboard and alert cards now supply the Overview compositions; chat, Pro and demo branding remain excluded. The inherited AMBAR flow and copy supply the content; the reference supplies component mechanics and visual conventions.

- Foundations are exact copies of `styles/theme.css`, `styles/typography.css` and the typography-aware `utils/cx.ts`.
- Base palette: white `#ffffff` foreground surfaces, BoardUI secondary `#f7f7f7`, border `#ebebeb`, primary text `#0a0a0a`, dark secondary `#121212`. AMBAR amber action stops use `#bb4d00` / `#973c00` rather than the old paper palette. Values are defined only at the token layer.
- Inter is the UI and title family. JetBrains Mono is reserved for shortcuts and actual access-scope code. Composite utilities set size, line-height, weight and tracking together: title-1/title-2, headline, body/body-2, caption-1. No ornamental serif or typographic index stamp remains.
- Surfaces use `background-*`, `text-*`, `foreground-icon-*`, `border-*`, status and chart semantic tokens. `ambar-theme.css` supplies only an accent ramp, accessible CTA stops, readable secondary metadata, verified chart/status/focus contrast and overlay tone. Light/dark use the same components.
- Panels/cards: rounded-3xl, subtle semantic border. Controls: BoardUI 10px radius, grouped segments and inset selected surface. Scale-based gaps/padding. Restrained shadows on cards and floating panels.
- Remix icons identify actions/types. Covers are deterministic AMBAR initials, type and site; no copied avatars, brand art or external image requests.

## Iterations — implementation evidence

1. **B1, structural/component pass:** replace the old motion/primitive layer with source-owned BoardUI forms, buttons, badges, segmented controls, notification and shell compositions; separate navigation, dialogs, overlays and feedback from vault orchestration.
2. **B2, explicit behavior gaps:** failing tests first demonstrated missing compact menu access, a blank real empty vault after reload, and an unhandled file-read failure. Implemented menu-to-import navigation, actionable empty shelf and a readable file recovery message without changing persistence.
3. **B3, compatibility pass:** preserved every original test; adapted Select trigger labelling to keep the field name separate from its selected-value description; Input respects explicit accessible names. Added a product-kind → target cents → reload integration contract.
4. **B4, rendered pass:** first production screenshot exposed a collision between the old `list-item` class name and Tailwind's display utility. Renamed it to `archive-row`, restoring the intended grid. Browser QA verifies actual row alignment and all three responsive widths, not only overflow. A separately reviewed missing mobile search close action received a failing test, then a named close button. Independent pixel measurements exposed four contrast gaps; semantic overrides now yield 8.49:1 dark rose text, 5.36:1 chart stroke, 5.70:1 ghost label and 4.70–5.03:1 focus ring. Every captured state receives an automated WCAG A/AA scan.

5. **B5, final interaction review:** real-focus RED/GREEN testing ensures malformed target inputs keep their focus ring. Browser measurement exposed an unmatched React Aria group selector and 20px actual input targets; a failing 44px assertion preceded a stable shell hook and compact-screen input sizing. The final browser suite measures the actual Link and Title fields, and captures the invalid-target focus state.

Named evidence and exact command/browser outcomes are recorded in `BOARDUI_VERIFICATION.md`; generated browser captures live under `artifacts/boardui/` (ignored build evidence). Final review inspects the current diff and rendered output independently.

## Final Design — current implementation contract

### Components and ownership

Installed free source: StatCards, RevenueChartCard, OrdersChartCard, ImportantAlertsCard, Button, IconButton, CloseButton, Input/InputBase/TextField, Label, HintText, Select/SelectItem and its menu/chevron/outside-press dependencies, SegmentedControl, Switch, Badge, Chip, StatusDot, Tooltip, Table and Notification. Exact source SHA-256 provenance and adaptation notes are in `src/styles/BOARDUI_SOURCE.json`; MIT text is preserved in `licenses/BoardUI-MIT.txt`.

AMBAR compositions own shell/navigation, dialogs, tabs, save feedback and archive content. Native semantic table adapts the free Table surface while keeping existing caption/cell-button semantics; a selectable ARIA grid, TanStack table, sorting and pagination are unjustified for this slice. Text-area composes the installed TextField/Label with React Aria TextArea. File input stays native for browser file selection. Notifications retain BoardUI's surface/status recipes and AMBAR's 4.2-second feedback lifetime; unused avatar/actions and all animation-library effects are removed. React Aria owns modal focus containment, Escape, outside dismissal and focus restoration. These are all one semantic visual system.

### Responsive and accessible states

- Desktop >1080px: expanded library panel and header section navigation. Tablet ≤1080px: full menu sheet, persistent vault status, two-column card/gallery layout. Mobile ≤760px: bottom navigation, icon view selector (all four choices), table list fallback and full-screen detail. ≤480px: single-column card/gallery.
- Keyboard: Cmd/Ctrl+K search; Alt+S save outside text inputs; arrow/Enter search results; roving segmented controls; arrow tabs; native form submission; Escape and focus return for dialogs. A named close control accompanies sheets/modals. Underlay is inert while any overlay is open.
- Touch: at least 44px for buttons, tabs, options, disclosures, switches and input targets on tablet/mobile, including portal contents. Form fields use 16px text on mobile to avoid iOS zoom.
- Focus: visible BoardUI accent ring; controls retain their semantic names even when visual labels collapse. Text direction accompanies price delta; history SVG includes every numeric value. Secondary metadata uses a darker semantic text value in light mode for legibility.
- Long titles, notes, sources and collection values wrap within min-width-zero columns. Accessible names always retain the full title. Notes preserve line breaks. Empty/error/recovery instructions identify an available next action.
- Reduced motion removes CSS animation/transitions; no JavaScript animation library remains. No decorative entrance, view-transition or cover animation is required to understand state.

### Explicit exclusions

No BoardUI Pro, paid widgets, copied BoardUI branding/demo data, AI/chat, cloud account, social OAuth, real price polling, real alert delivery, scraping, embedding, pagination without volume, new backend, public sharing or production data. No permanent parallel beUI/Base UI/lucide visual layer. Historical beUI license attribution is retained as provenance only. No commit, push, deploy, publish or paid action is part of this migration.
