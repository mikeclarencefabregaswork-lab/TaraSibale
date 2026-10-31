> **Portfolio prototype (default mode):** Independent demonstration, not an official municipal website. Accounts, uploads, bookings and publishing are blocked server-side; existing database records are preserved. Unknown-rights images use placeholders, and maps use a local schematic grid. No public demo login is required. See [portfolio mode and future launch checklist](docs/portfolio-release-checklist.md) before deploying, transferring assets or enabling real services.

# TaraSibale

The supplied TaraSibale tourism interface is integrated into `Frontend/`, with an Express API in `Backend/` and native PostgreSQL persistence. Docker is not required.

## This local Linux setup

Repository contents are installed directly in this `TaraSibale` folder.
Dependencies are installed and the project-local PostgreSQL database has been migrated and seeded.

- Database: `tarasibale`, user: `mikeonlinux`, host: `127.0.0.1`, port: `5433`.
- Private connection credentials: `Backend/.env` (ignored by Git).
- Database files and server log: `.local-postgres/` (ignored by Git).
- The project-local instance runs separately from the system PostgreSQL service on port 5432.
- No application accounts are seeded; create an account through signup.

From this folder, start PostgreSQL when it is stopped, then start the app:

```bash
npm run db:start
npm run dev
```

Open http://localhost:5173. The backend runs at http://127.0.0.1:3001.
Use `npm run db:status` to check PostgreSQL and `npm run db:stop` to stop it.
The project database does not automatically start after a reboot. Do not delete
`.local-postgres/` unless you intend to remove the local database and its data.

## Run locally

Requirements: Node.js 22.12+ and npm, PostgreSQL running on Windows (verified with PostgreSQL 18).

1. Configure `Backend/.env` using `Backend/.env.example`. Point `DATABASE_URL` to your existing `tarasibale` database. Keep credentials in that ignored file; URL-encode special characters in the password.
2. Install dependencies, apply migrations, and import the reference catalog:

```powershell
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` to the backend at http://127.0.0.1:3001. If you change the backend port, update `Frontend/vite.config.ts` too.

Migrations are recorded and run transactionally. Seeding inserts only missing reference records and preserves later edits. Your local database has already been migrated and seeded during integration.

## Accounts and administrator access

Create an account through the app. Passwords are hashed with salted scrypt; session cookies are HttpOnly and SameSite=Lax. Signup cannot create administrators. Resident, host, and guide accounts begin unverified and appear in the administrator verification queue.

To promote an existing account, run locally:

```powershell
npm run admin:promote -- your-email@example.com
```

Refresh the page or sign in again after promotion. There are no default passwords, demo accounts, automatic administrator logins, or browser-only permission bypasses. All private writes and admin operations are authorized by the API.

## Persistence and model

See [database documentation](docs/database.md) for the schema, relationships, JSONB choices, migration behavior, and tooling.

The API persists accounts/sessions, reference content, bookings, reviews/helpful votes, travel-group messages/membership, social posts/likes, verification applications, permissions, and per-user notifications, itineraries, checklists, and document vault data.

Bookings validate accommodation, room type, guest count and date range; the server calculates totals. An accommodation row lock serializes inventory checks so concurrent requests cannot oversell available rooms. Stored bookings belong to the signed-in user. Confirmation is a record in this local application: no payment gateway, email delivery, or external accommodation reservation system is connected.

The supplied place, culture, trail, and ferry content is reference material from the ZIP. Ratings/counts come from stored reviews. There is no live weather, maritime, or social provider; refresh reloads stored data. The travel concierge uses a clearly identified curated guide and requires no AI key. Map tiles and externally hosted photos require network access; map references are not navigation or safety guarantees.

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

Unit/HTTP tests (`npm test`) run without a configured database. Integration tests use the configured database to create a randomly named temporary schema, exercise real PostgreSQL constraints and APIs, and remove only that test schema afterward; they do not modify application rows. The database role needs permission to create schemas for this test command.

Health checks:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/health
Invoke-RestMethod http://127.0.0.1:3001/api/health/db
```

The database check executes `SELECT 1` and returns HTTP 503 without connection secrets when PostgreSQL is unavailable. Normal API failures are JSON responses; the frontend displays write failures instead of claiming success.

## Database lifecycle and deployment

The Asi phrasebook’s source and regional/audio limitations are documented in [docs/phrasebook-sources.md](docs/phrasebook-sources.md).

Use Windows Services (`services.msc`) to start/stop the installed PostgreSQL service. Keep it running while developing. The old Docker volume has not been deleted or migrated; stop its container before running another PostgreSQL server on the same port.

`npm run build` produces `Frontend/dist` and `Backend/dist`. Start the compiled API with `npm run start --workspace Backend`; check static output with `npm run preview --workspace Frontend`. The API currently loads `Backend/.env` through the start script. Vite development and preview proxy `/api` locally. Production hosting needs a static host/reverse proxy routing `/api` to Express, HTTPS, `NODE_ENV=production`, and `APP_ORIGIN` set to the frontend origin. Use a dedicated least-privileged runtime database role when deploying; the local administrator connection is for development and migrations.

## Integration source

Source ZIP: `tarasibale-webapp.zip`. UI/assets were imported; AI Studio server/build scripts, embedded project instructions, generated artifacts, and Gemini credentials were not imported as executable configuration. The prior starter was backed up in ignored `.superpowers/frontend-starter`; the inspected ZIP is in `.superpowers/zip-review`.

Graphify was requested, but repository/workspace queries returned `No workspace is selected for this agent`; source files and TypeScript contracts were inspected directly.

## References

- [Vite](https://vite.dev/guide/)
- [Express](https://expressjs.com/en/starter/installing/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [Node password hashing](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback)
