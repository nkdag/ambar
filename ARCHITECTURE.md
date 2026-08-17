# AMBAR — Architecture

## v0
Next.js App Router + React 19 + TypeScript + Tailwind CSS 4. UI behavior is local and deterministic. Domain functions stay framework-independent and tested.

```text
UI routes/components
  → local application state
  → domain functions (search, parsing, price calculations)
  → realistic immutable fixtures
```

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
