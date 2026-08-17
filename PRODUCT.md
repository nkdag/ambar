# AMBAR — Product

## Promise
Kaydettiğin her şey tekrar bulabildiğin, değişimini görebildiğin bir yerde yaşasın.

AMBAR links, articles, social posts, and products in one calm personal archive. Product saves can carry price history and alerts. The data model is designed for scoped CLI/MCP access without making AI part of the product.

## Target user
A person who saves across browsers and social platforms, loses track of products and reading material, and wants durable ownership and agent-friendly access.

## Core loop
1. Capture a link or import Chrome bookmarks.
2. See it immediately in Inbox while deterministic metadata is enriched.
3. Organize with collection, tags, notes, and type.
4. Return through fast search and purpose views.
5. For products, set a target and revisit when the price changes.

## Current outcome — Local Vault tracer bullet
AMBAR is moving from an interactive prototype to an honest single-device product. An empty browser sees a clearly labelled example vault that is never written as personal data. The first personal save creates a user-only, versioned local vault; later quick saves and product targets persist across reloads. Duplicate normalized URLs are refused. Corrupt or unsupported local data fails closed into a recoverable state instead of crashing or silently discarding records.

The next cloud slice may add real Supabase identity and cross-device sync, but only with a real backend, workspace ownership, RLS, export, and account deletion. AMBAR never presents a decorative login screen as working authentication.

## Non-goals for this slice
- Generative AI, embeddings, semantic search
- Fake account/backend, social OAuth, scraping, or notifications
- Cross-device sync, public sharing, collaboration, billing
- Browser extension or native mobile app
- Fake MCP functionality; only an honest future-access surface

## Product wedge after v0
Private living archive + product price tracking + user-controlled agent access.

## Risks to falsify next
- X sync cost and policy under a real OAuth test
- Instagram Saved availability through user export fixtures
- Merchant coverage and reliable price extraction
- Whether CLI/MCP access creates recurring value beyond power users
