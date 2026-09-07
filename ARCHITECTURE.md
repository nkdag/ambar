# AMBAR — Architecture

## Current local-vault slice
Next.js App Router + React 19 + TypeScript + Tailwind CSS 4. Domain functions stay framework-independent and tested.

```text
UI routes/components
  → hydrated application state
  → versioned local-vault adapter
  → domain functions (validation, normalized URL identity, search, parsing, price calculations)
  → realistic immutable fixtures shown only as a labelled, unsaved example vault
```

The initial server/client render uses deterministic fixtures. Local storage is read after hydration. An empty store stays empty: fixtures are never written as user data. The first personal save replaces the example view with a user-only vault; later explicit mutations report the real write result. Mutations rebase on the latest stored vault while holding an atomic browser Web Lock, and `storage` events reconcile other open tabs without dismissing pending local changes, preventing silent whole-vault overwrites. Browsers without Web Locks fail closed rather than writing unsafely. The adapter returns explicit `empty`, `ready`, `corrupt`, `unsupported`, busy, and write-failure outcomes. Payloads are runtime-validated before they reach application state.

The public artifact is a static Next.js export. Local builds serve from `/`; GitHub Pages builds use `/ambar` with trailing-slash routes. Metadata routes, legal pages, the custom 404, icons, and the social preview are generated without a runtime server. `scripts/verify-launch.mjs` validates both artifact shapes, internal references, image dimensions/budgets, secret-like values, and first-load transfer size. GitHub Pages owns HTTP-to-HTTPS enforcement.

## Production direction
A TypeScript modular monolith with a separate worker:

```text
Next.js web + /api/v1
  → application services
  → PostgreSQL + object storage
  → Postgres job queue/outbox
  → isolated fetch/extraction worker
  → CLI adapter, then scoped MCP adapter
```

## Planned boundaries
- Identity: users, workspaces, memberships
- Library: items, URL targets, assets, notes
- Organization: collections, tags
- Ingestion: connections, runs, source records
- Prices: offer trackers, observations, alert rules, deliveries
- Access: scoped credentials, shares, audit events

## Invariants
- Every record is workspace-owned; PostgreSQL RLS plus application checks.
- Social/provider data never overwrites user-authored title or notes.
- Price uses decimal amount plus ISO currency, never float in persistence.
- Save/import commands are idempotent.
- External fetch workers block SSRF targets, cap MIME/size/time/redirects, and never execute fetched HTML.
- CLI and MCP call `/api/v1`; neither receives direct database or upstream OAuth-token access.
- Agent credentials are hashed, scoped, expiring, revocable, and audited.

## Connector truth
- Chrome: standards-based HTML import.
- X: OAuth user-context polling and reconciliation; cost/policy must be tested.
- Instagram: no official Saved endpoint; manual share/export only until verified.
- Price: official feed → JSON-LD → allowlisted adapter → unsupported bookmark.
