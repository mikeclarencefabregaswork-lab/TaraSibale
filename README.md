> **Portfolio prototype (default mode):** Independent demonstration, not an official municipal website. Accounts, uploads, bookings and publishing are blocked server-side; existing database records are preserved. Photos, the TaraSibale logo and geographic map layers remain visible, with source/provider credits. No public demo login is required. See [portfolio mode and future launch checklist](docs/portfolio-release-checklist.md) before deploying, transferring assets or enabling real services.

# TaraSibale

The supplied TaraSibale tourism interface is integrated into `Frontend/`, with an Express API in `Backend/` and native PostgreSQL persistence. Docker is not required.

## This local Linux setup

This checkout uses the existing system PostgreSQL server on `127.0.0.1:5432`.
The `tarasibale` database is owned by the existing role `gemini.psql`.
Private connection credentials are in `Backend/.env` (ignored by Git).
Dependencies, numbered migrations through 010, and the reference catalog are installed.
No application accounts are seeded. Portfolio mode is enabled, so signup,
bookings, uploads, and publishing are intentionally blocked.

```bash
npm run db:status
npm run dev
```

Open http://localhost:5173. The API runs at http://127.0.0.1:3001.
`npm run db:start` and `npm run db:stop` use sudo and control the **system**
PostgreSQL service, including any other databases it serves. Do not stop it
while other projects need it. The ignored `.local-postgres/` folder is an
unused initialization attempt, not the active application database.

For a fresh database on this machine, run the password-prompting bootstrap
from the repository root:

```bash
psql -X -h 127.0.0.1 -U gemini.psql -d postgres -f Backend/gemini.psql
npm run db:migrate
npm run db:seed
```

The bootstrap requires the existing role to have database-creation privileges.
It preserves an existing database, refuses an unexpected owner, and never
changes a role or password. Configure `Backend/.env` to point at `tarasibale`
before running migrations. See [local knowledge tools](docs/knowledge-tools.md)
for the Graphify graph and Obsidian vault.

For a guided explanation of the codebase, begin with
[TaraSibale — Start Here](docs/obsidian/00%20TaraSibale%20-%20Start%20Here.md).
The Obsidian export includes these guides, source links, and a reading map.

## Run locally

Requirements: Node.js 22.12+ and npm, and a running PostgreSQL server (verified with PostgreSQL 18).

1. Configure `Backend/.env` using `Backend/.env.example`. Point `DATABASE_URL` to your existing `tarasibale` database. Keep credentials in that ignored file; URL-encode special characters in the password.
2. Install dependencies, apply migrations, and import the reference catalog:

```powershell
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` to the backend at http://127.0.0.1:3001. If you change the backend port, update `Frontend/vite.config.ts` too.

Migrations are recorded and run transactionally. Seeding inserts only missing reference records and preserves later edits. This checkout’s local database has been migrated and seeded.

## Accounts and administrator access

The default portfolio mode blocks account creation and sign-in. For intentional local full-application development, set `PORTFOLIO_MODE=false` in `Backend/.env` and `VITE_PORTFOLIO_MODE=false` in `Frontend/.env`, then restart the app. Create an account through the app in that mode. Passwords are hashed with salted scrypt; session cookies are HttpOnly and SameSite=Lax. Signup cannot create administrators. Resident, host, and guide accounts begin unverified and appear in the administrator verification queue.

To promote an existing account, run locally:

```powershell
npm run admin:promote -- your-email@example.com
```

Refresh the page or sign in again after promotion. There are no default passwords, demo accounts, automatic administrator logins, or browser-only permission bypasses. All private writes and admin operations are authorized by the API.

## Persistence and model

See [database documentation](docs/database.md) for the schema, relationships, JSONB choices, migration behavior, and tooling.

The API persists accounts/sessions, reference content, bookings, reviews/helpful votes, travel-group messages/membership, social posts/likes, verification applications, permissions, and per-user notifications, itineraries, checklists, and document vault data.

Community posts support one optional device photo with preview, replacement and removal, or a caption-only post. JPEG, PNG and WebP files up to 5 MiB are resized locally to 1600px and at most 1 MiB before saving with the post. Portfolio mode still blocks publishing. See [community image attachments](docs/community-post-images.md) for processing, storage and verification details.

Bookings validate accommodation, room type, guest count and date range; the server calculates totals. An accommodation row lock serializes inventory checks so concurrent requests cannot oversell available rooms. Stored bookings belong to the signed-in user. Confirmation is a record in this local application: no payment gateway, email delivery, or external accommodation reservation system is connected.

The supplied place, culture, trail, and ferry content is reference material from the ZIP. Ratings/counts come from stored reviews. The hero's weather panel uses Open-Meteo weather and marine model estimates, with current conditions, wind/gusts and a 24-hour offshore wave outlook. Expand **Sea conditions** for details. See [weather data and limitations](docs/weather.md). There is no live ferry-clearance or social provider. The travel concierge uses a clearly identified curated guide and requires no AI key. Map tiles and externally hosted photos require network access; map references are not navigation or safety guarantees.

The Beaches & Island Landmarks catalog has since been replaced with six researched Sibale destinations. See [attraction sources and photo credits](docs/attraction-sources.md). The original demo attractions are archived, preserving existing references. Linked destination photos are authorized for this local preview; public reuse permission has not been established. Unconfirmed locations have no visible map pin, and unknown fees/hours are labeled for local confirmation.

The Fiestas & Customs tab now contains the December 8 Immaculate Conception feast and documented local customs, with citations and historical/current-program distinctions. See [fiesta source notes](docs/fiesta-sources.md). Its source review does not verify the separate phrasebook or food entries.

Document vault files are limited to PDF and PNG/JPEG/WebP images, 1 MB per file, 20 records and 4 MB total encoded content per account. Documents are private to their owner and stored in PostgreSQL for this local implementation; use dedicated private object storage for larger production uploads.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
```

Unit/HTTP tests (`npm test`) run without a configured database. Integration tests explicitly disable portfolio mode for their isolated test app and use the configured database to create a randomly named temporary schema, exercise real PostgreSQL constraints and APIs, and remove only that test schema afterward; they do not modify application rows. The database role needs permission to create schemas for this test command.

Health checks:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/health
Invoke-RestMethod http://127.0.0.1:3001/api/health/db
```

The database check executes `SELECT 1` and returns HTTP 503 without connection secrets when PostgreSQL is unavailable. Normal API failures are JSON responses; the frontend displays write failures instead of claiming success.

## Database lifecycle and deployment

The Asi phrasebook’s source and regional/audio limitations are documented in [docs/phrasebook-sources.md](docs/phrasebook-sources.md).

On this Linux machine, the existing system PostgreSQL service supplies the database; use `npm run db:status` to check readiness. On Windows, use Services (`services.msc`) to manage PostgreSQL. Keep the server running while developing. The old Docker volume has not been deleted or migrated; stop its container before running another PostgreSQL server on the same port.

`npm run build` produces `Frontend/dist` and `Backend/dist`. Start the compiled API with `npm run start --workspace Backend`; check static output with `npm run preview --workspace Frontend`. The API currently loads `Backend/.env` through the start script. Vite development and preview proxy `/api` locally. Production hosting needs a static host/reverse proxy routing `/api` to Express, HTTPS, `NODE_ENV=production`, and `APP_ORIGIN` set to the frontend origin. Use a dedicated least-privileged runtime database role when deploying; the local administrator connection is for development and migrations.

## Integration source

Source ZIP: `tarasibale-webapp.zip`. UI/assets were imported; AI Studio server/build scripts, embedded project instructions, generated artifacts, and Gemini credentials were not imported as executable configuration. The prior starter was backed up in ignored `.superpowers/frontend-starter`; the inspected ZIP is in `.superpowers/zip-review`.

The local Graphify CLI indexes this checkout and exports linked Obsidian notes. The separate Graphify cloud connector currently has no available workspaces; it is not configured or required for local indexing. See [knowledge tools](docs/knowledge-tools.md).

## References

- [Vite](https://vite.dev/guide/)
- [Express](https://expressjs.com/en/starter/installing/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [Node password hashing](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback)
