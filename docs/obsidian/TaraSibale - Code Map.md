---
tags: [tarasibale/guide]
reviewed: 2026-11-07
---

# Code Map

Choose the file by the behavior you need to understand. A symbol name alone
does not establish whether it is active in the runtime flow.

| Goal | Start in | Why |
| --- | --- | --- |
| Understand navigation and shared state | `Frontend/src/App.tsx` | URL-hash tabs, public refresh, identity, account bootstrap |
| Understand destination cards | `Frontend/src/components/AttractionsSection.tsx` | Category/search filtering, details, current-visit favorites |
| Trace an API failure in the UI | `Frontend/src/api.ts` | Cookie-bearing requests and surfaced server errors |
| Understand trip-note persistence | `Frontend/src/userState.tsx` | Guest storage, debouncing, account-bound saves |
| Inspect map behavior | `Frontend/src/components/InteractiveMap.tsx` | Map layers, schematic portfolio behavior, interactions |
| Inspect cultural content UI | `Frontend/src/components/CulturalGuide.tsx` | Culture collection presentation |
| Understand API startup | `Backend/src/server.ts`, `app.ts` | Listener/shutdown, health, portfolio boundary |
| Trace a route into SQL | `Backend/src/api.ts` | Auth, public catalog, user state, bookings, admin writes |
| Understand passwords | `Backend/src/auth.ts` | Salted scrypt hashing and constant-time comparison |
| Understand payload constraints | `Backend/src/validation.ts` | Input schemas and document limits |
| Check publishing abuse limits | `Backend/src/publishing.ts` | Per-account publishing limiter |
| Understand database connectivity | `Backend/src/db.ts` | Pool configuration and database readiness |
| Change schema intentionally | `Backend/migrations/` | Ordered, recorded migrations; applied files stay immutable |
| Understand reference import | `Backend/scripts/seed.ts` and `Backend/seed/catalog.json` | Missing-record insertion, not overwrite-on-refresh |

## A practical investigation

If an attraction description is wrong on screen:

1. Read [[TaraSibale - Attractions and Data]] to identify the runtime source.
2. Follow `App.refreshCatalog` into `GET /api/catalog` in the backend.
3. Check the resource's stored JSON, archive status, and presentation transform.
4. Review source provenance and choose an intentional data update path.

Changing the reference `ATTRACTIONS` constant alone bypasses none of those
steps and does not change the served catalog.

## Use the symbol graph after choosing a path

[[App()]] coordinates the interface; [[createApp()]] installs the HTTP boundary;
[[createApi()]] creates the API router; [[checkDatabase()]] checks connectivity;
[[portfolioCatalog()]] prepares the demo response. These links now lead to their
owning canonical sections. Use the Graphify CLI for indexed neighbors and read
actual source when graph relationships are missing or stale.

Continue: [[TaraSibale - Using the Knowledge Base]].

Sources: [frontend shell](../../Frontend/src/App.tsx), [backend API](../../Backend/src/api.ts),
[validation](../../Backend/src/validation.ts), [publishing limits](../../Backend/src/publishing.ts),
[database connection](../../Backend/src/db.ts), [seed script](../../Backend/scripts/seed.ts).
