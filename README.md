# TaraSibale

TaraSibale is a travel planning web app for Sibale (Concepcion, Romblon). Explore island destinations and local culture, browse a map, and build a sample trip around ferry crossings and places to visit. It is an independent portfolio project, separate from any official municipal service.

## What you can explore

- **Destinations and culture.** Browse beaches, landmarks, trails, reference lodgings, barangay fiestas, local food, and an Asi phrasebook. Start with the [attraction sources and photo credits](docs/attraction-sources.md), [accommodation sources](docs/accommodation-sources.md), [fiesta research](docs/fiesta-sources.md), [food sources](docs/food-sources.md), and [phrasebook sources](docs/phrasebook-sources.md).
- **Maps and sea conditions.** Switch map layers and open **Sea conditions** for current weather, wind and gusts, and a 24-hour offshore wave outlook from Open-Meteo. Ferry schedules and trail routes are reference material. Verify crossings and local conditions with the operator. See [weather data and limitations](docs/weather.md).
- **Sample trip planning.** Build an itinerary, keep a checklist, and ask the curated travel guide for suggestions. Portfolio itineraries and checklists stay in the browser. The guide requires no AI key.

**Portfolio mode is on by default.** Visitors can browse without an account. The API blocks sign-up, sign-in, bookings, uploads, publishing, and access to private records in this mode. Use sample information. See the [portfolio release checklist](docs/portfolio-release-checklist.md) for asset rights and public hosting requirements.

## Run locally

You need Node.js 22.12 or newer, npm, and a running PostgreSQL server. Docker is optional.

1. From the repository root, run `npm ci`.
2. Create or select a PostgreSQL database. For this Linux workspace, use `tarasibale` on `127.0.0.1:5432`, owned by the existing PostgreSQL role `gemini.psql`. Check readiness with `npm run db:status`. If the database is missing and the role can create databases, run:

   ```bash
   psql -X -h 127.0.0.1 -U gemini.psql -d postgres -f Backend/gemini.psql
   ```

   The bootstrap preserves an existing database and checks its owner. If the role cannot create databases, have a PostgreSQL administrator create it with that role as owner. For the local system service on Linux, `npm run db:start` starts PostgreSQL with sudo.
3. If `Backend/.env` is missing, create it from [`Backend/.env.example`](Backend/.env.example). Set `DATABASE_URL` to the application database and URL-encode special characters in the password. Keep credentials in the ignored `Backend/.env` file.
4. Apply the schema, seed the reference catalog, and start both workspaces:

   ```bash
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

Open [TaraSibale](http://localhost:5173). Vite forwards `/api` to Express at `http://127.0.0.1:3001`. If you change the backend address, set `API_PROXY_TARGET` in the shell before starting Vite. Check [API health](http://127.0.0.1:3001/api/health) and [database connectivity](http://127.0.0.1:3001/api/health/db) separately if the page opens but data does not load.

Fresh databases use [migration 012](Backend/migrations/012_baseline.sql). Existing databases apply any pending legacy upgrades before recording the baseline. Seeding inserts missing reference records and preserves edits. Back up an existing database before upgrading, and use a new numbered migration for schema changes. See [database documentation](docs/database.md).

## Develop account features locally

Set `PORTFOLIO_MODE=false` in `Backend/.env` and `VITE_PORTFOLIO_MODE=false` in `Frontend/.env`, then restart both workspaces. Create an account in the app. There are no seeded accounts or default passwords. To grant administrator access to an existing account:

```bash
npm run admin:promote -- your-email@example.com
```

Full mode supports account saves, reviews, travel groups, [community posts with optional photos](docs/community-post-images.md), and private documents. The booking flow creates local records for bookable test data. The sourced lodgings are reference listings, and no payment, email, or external reservation service is connected. Keep portfolio mode enabled for public demonstrations.

## Workspace and checks

| Path | Purpose |
| --- | --- |
| [`Frontend/`](Frontend/) | React and TypeScript UI built with Vite, with Tailwind CSS and Leaflet maps |
| [`Backend/`](Backend/) | Express and TypeScript API, PostgreSQL access, migrations, and catalog seeds |
| [`docs/`](docs/) | Content sources, architecture guides, and deployment notes |
| [`scripts/`](scripts/) | Workspace tools, including Graphify context and Obsidian export |

Run checks from the repository root:

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
```

`npm test` does not need PostgreSQL. The integration suite uses `Backend/.env` and requires permission to create a temporary schema. It disables portfolio mode only for its test app and removes its test schema afterward.

The [Playwright workflow](.github/workflows/playwright.yml) currently runs example tests against the Playwright website. It does not exercise TaraSibale in a browser.

## Graphify and Obsidian

Start with [TaraSibale — Start Here](docs/obsidian/00%20TaraSibale%20-%20Start%20Here.md) for the architecture and feature flows. With the Graphify CLI installed, run the following after source changes:

```bash
npm run graph:build
npm run graph:obsidian
```

Open `graphify-out/graph.html` for the interactive graph. In Obsidian, open `graphify-out/obsidian/` as a vault and start with **00 TaraSibale - Start Here** or the **Reading Map**. The export groups related code into a small set of guides and reference notes. Generated files stay out of Git. Graphify web indexes GitHub separately and can show a different snapshot. See [Graphify and Obsidian](docs/knowledge-tools.md) for querying the graph and refreshing an existing vault.

## Deployment

`npm run build` writes the static site to `Frontend/dist` and compiles the API to `Backend/dist`. Start the compiled API with `npm run start --workspace Backend`. Serve the frontend over HTTPS and route `/api` on the same origin to Express. Set `NODE_ENV=production` and set `APP_ORIGIN` to the exact frontend origin. For a public demo, use a separate database containing approved sample records and follow the [portfolio release checklist](docs/portfolio-release-checklist.md) before publishing.

TaraSibale’s original interface and assets were adapted from `tarasibale-webapp.zip`. Content provenance and reuse status are documented in the linked source notes.
