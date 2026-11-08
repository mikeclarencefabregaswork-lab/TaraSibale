---
tags: [tarasibale/guide]
reviewed: 2026-11-09
---

# Development

Run commands from the repository root. The project uses npm workspaces named
`Frontend` and `Backend`, Node.js 22.12 or newer, and native PostgreSQL.

## Start and check the app

```bash
npm run db:status
npm run dev
```

The frontend is at `http://localhost:5173`; the backend listens on
`127.0.0.1:3001`. Vite forwards `/api` to the backend. PostgreSQL is the existing
system service on port 5432. The ignored `.local-postgres/` initialization from
setup is not the active application database.

`db:start` and `db:stop` use sudo to control the system PostgreSQL service.
That service may also serve other projects; these commands do not target only
the TaraSibale database.

## Schema and reference content

```bash
npm run db:migrate
npm run db:seed
```

These use the connection saved in `Backend/.env`. Do not paste the connection
URL into notes or chat. On a fresh installation, `Backend/gemini.psql` creates
the database under the existing `gemini.psql` role; it does not create or reset
that role. See [[TaraSibale - Database]] before changing schema or catalog data.

## Verification commands

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
```

Unit/HTTP tests cover errors, auth helpers, portfolio boundaries, frontend
requests, and development file isolation. Integration tests create a temporary
schema in the configured database and remove it afterward. They explicitly
use full mode for their isolated test application, so local portfolio settings
do not block the workflows under test.

## Review and repairs — 2026-11-09

The risk-based review found one medium security issue in optional full mode:
inline post images could amplify the public catalog response. SQL now projects
attachment bytes out before transferring rows, and images load individually.
Integration regressions demonstrate a metadata-sized response with four persisted
1 MiB attachments, correct image bytes/MIME, malformed-image rejection, and
consistent create/catalog/like representations. No migration or record rewrite
was needed. Default portfolio restrictions remain enforced.

The same review repaired map popup loss and unnecessary marker reconstruction,
day-trip generation, same-day drag ordering, and wrong-port ferry replacements.
See [[TaraSibale - Feature Flows]] for the current behavior.

Type checking, lint, unit tests, PostgreSQL integration and production build are
the required verification gates. The test runner needs local socket access; a
sandbox `EPERM` from tsx IPC or an HTTP listener is an environment failure, not a
product regression. Dependency audit reported zero advisories on this date.
Final combined verification: 68 unit/HTTP tests and 25 integration tests passed;
typecheck, lint and build passed. Lint retains two existing React
`set-state-in-effect` warnings. Browser checks covered map popup/details,
incompatible day-trip rejection, early checkout and a 390 px mobile layout with
no horizontal overflow or console warnings/errors.

Source review is risk-based, not a claim that every line or production deployment
has been audited. Production exposure, HTTPS/proxy configuration and database
privileges still require environment-specific review. Never copy credentials
into review notes.

## Diagnose the boundary that failed

| Symptom | First check |
| --- | --- |
| Frontend does not open | Is `npm run dev` running? Is port 5173 already occupied? |
| Page opens but catalog fails | Check backend logs and `/api/health/db` through the frontend proxy |
| `/api/health` succeeds but database readiness returns 503 | Server is alive; PostgreSQL connection or configuration is failing |
| Signup or a write returns 403 | Read [[TaraSibale - Modes and Access]] before assuming a database defect |
| Editing a fixture does not change the page | Read [[TaraSibale - Attractions and Data]] |
| Guest itinerary is absent on another browser | Guest saved state is device-local; see [[TaraSibale - Saved State]] |
| Obsidian cards appear empty | Export with the npm wrapper so paths are relative to the actual vault root |

Sources: [root commands](../../package.json), [backend commands](../../Backend/package.json),
[health routes](../../Backend/src/app.ts), [integration suite](../../Backend/test/api.integration.ts),
[local setup](../../README.md).
