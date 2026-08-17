# AMBAR

AMBAR is a calm, living personal archive for links, reading, and products. This repository currently contains the **v0 local interactive prototype**: realistic fixture data, quick-save behavior, deterministic search/filtering, Chrome bookmark HTML preview, product price history/targets, multiple views, and responsive light/dark UI.

## Prototype boundary

- Data is held in browser memory and resets on reload.
- Chrome import is a safe preview; it does not persist imported bookmarks.
- Price history and alerts are demo state; there is no polling or notification delivery.
- There is no account, sync, scraping, social API, CLI, or MCP connection yet.

## Run

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `localhost` rather than `127.0.0.1` with the Next.js development server so client chunks are allowed to hydrate.

## Quality gates

```bash
npm test
npm run lint
npm run build
npm start
```

## Product contracts

- [`PRODUCT.md`](./PRODUCT.md) — promise, core loop, positioning, and non-goals
- [`SPEC.md`](./SPEC.md) — executable v0 slice and acceptance criteria
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — current and public-ready boundaries
- [`DESIGN.md`](./DESIGN.md) — visual, responsive, motion, and accessibility contract
- [`AGENTS.md`](./AGENTS.md) — repository working rules
- [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) — beUI attribution and MIT license

## Planned next slice

Replace fixture/in-memory state with a tested persistent item service, then connect real metadata extraction and controlled product price observations. CLI and MCP will share that service boundary rather than bypass it.
