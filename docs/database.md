# Native PostgreSQL storage

Use the native PostgreSQL server configured by `Backend/.env` (`DATABASE_URL`). Never commit that file or print its value. PostgreSQL 18 is the locally verified target. No Docker or external database service is required.

Run from `Backend`:

```powershell
npm run db:migrate
npm run db:seed
npx tsx --env-file=.env scripts/validate-seed.ts
npm run admin:promote -- existing-account@example.com
```

These scripts run `tsx --env-file=.env scripts/migrate.ts`, `tsx --env-file=.env scripts/seed.ts`, and `tsx --env-file=.env scripts/promote-admin.ts`, respectively. From the workspace root append `--workspace Backend` to the npm command before `--`. Create a real account through signup before promoting it. The promotion command changes only that existing account's role and verification flag; it never generates a password or default administrator.

## Migrations and recovery

[`migrations/012_baseline.sql`](../Backend/migrations/012_baseline.sql) is the starting schema for a fresh database. It creates the five catalog tables directly. Run `npm run db:seed` afterward to load the reference catalog.

Databases with existing migration history first apply any missing upgrades from `Backend/migration-history/`, then record the baseline without recreating tables or seeding data. The archived SQL keeps its original filenames and contents. Add future changes as numbered SQL files after the baseline in `Backend/migrations/`.

The runner records completed versions in `schema_migrations`. Pending migration SQL and history entries share a transaction. A transaction-scoped advisory lock serializes migrations and seeding. SQL migration files must omit transaction-control statements because the runner owns the transaction.

A failed migration rolls back both DDL and history. There is deliberately no destructive reset or automatic down migration. Back up a populated database before future schema changes and use a reviewed forward migration or restore an appropriate backup when recovery is needed.

Migration `002_strict_trail_coordinates.sql` corrects PostgreSQL JSONPath lax-mode array unwrapping in the initial trail constraint. Coordinate pairs use strict path evaluation so valid `[latitude, longitude]` arrays pass while wrong-length arrays remain rejected. The initial migration remains immutable.

Migration `003_unavailable_catalog_photo.sql` replaces one known unavailable image URL from the imported catalog with a local placeholder. Only the exact obsolete URL is changed; other content and administrator edits are preserved.

Migrations `004_sourced_sibale_attractions.sql` and `005_attraction_visitor_copy.sql` replace the published demo attractions with six researched entries and visitor-facing descriptions. Original IDs remain archived for reference integrity. Catalog reads and new review targets exclude archived entries. The [source notes](attraction-sources.md) document external photograph credits, preview-only permission status and mapped versus unconfirmed locations.

Migration [011](../Backend/migration-history/011_split_catalog.sql) copies the entire catalog, including archived entries, to five content tables, then switches the review and booking foreign keys and drops the legacy catalog table in the same transaction. For an existing installation, back up the database, stop the app, run `npm run db:migrate` from the workspace root, then start the updated app. The migration preserves IDs and payloads, so an existing installation does not need to reseed.

After migrations, run `npx tsx --env-file=.env scripts/validate-seed.ts` from `Backend` to exercise every seed catalog entry against the actual database constraints and require four malformed coordinate shapes to fail. This integration check uses fresh temporary IDs inside a transaction and always rolls back its inserts; it works before or after seeding without overwriting catalog records.

## Model and ownership

- `users` stores accounts, scrypt password hashes, server-assigned roles and verification. A unique index on `lower(email)` prevents case variants. `sessions` stores hashed random bearer tokens with expiry, linked to users with cascading deletion.
- `attractions`, `accommodations`, `ferry_routes`, `culture_items`, and `hiking_trails` each store their own catalog entries. Each table checks that the JSON `id` matches the primary key and validates the core fields for that content type. Admin and seed writes check for IDs already used in other content tables. `settings` holds the complete boolean permissions object.
- `reviews` belongs to a real user and links to one catalog table through its target type. New reviews can target published attractions and accommodations. Older reviews retain their original target, including other content types. Ratings must be whole numbers from 1 to 5; comments must be nonempty and bounded. `review_votes` has one row per voter/review pair.
- `bookings` belongs to a real user. A foreign key links each booking to `accommodations`; dates, positive party size, nonnegative total and known status are constrained. The API must still enforce capacity, room types, current prices and concurrent overlapping inventory while holding an accommodation row lock in its booking transaction. The database stores authoritative dates/amount/status in relational columns alongside the UI response JSON.
- `travel_groups`, `group_members` and `messages` store group membership and chat history. The API checks membership and messaging permission. `social_posts` and `social_likes` store posts and one like per user/post pair.
- `verifications` links applications to users when available. Posts and applications retain their payload if the linked account is deleted, with the relational user reference set to null. Reviews, bookings, sessions, votes, memberships, messages, likes and `user_state` cascade when their owner is deleted. Catalog entries referenced by reviews or bookings cannot be deleted.
- `user_state` stores each account's notification, private document, itinerary and checklist collections. The API always derives the owner from the session. Documents may contain validated PDF/PNG/JPEG/WebP base64 data URLs, limited to 1 MB per uploaded file, 20 documents and 4 MB total encoded content. This bounded local implementation stores file content in JSONB; larger production uploads should use private object storage. `updated_at` is set by API writes.

Indexes support session expiry cleanup, recent reviews/bookings/posts, inventory overlap searches and foreign-key access. JSONB preserves the supplied UI objects without scattering optional display fields across many columns. This permits additive UI fields, but requires API validation and consistency checks for duplicated relational values. It does not replace relational ownership, uniqueness, foreign keys or transactional inventory checks.

## Seed provenance and external data

`seed/catalog.json` is a standalone reference catalog matching the frontend data, including the subsequently sourced attractions and fiesta/custom entries. Runtime seeding has no dependency on frontend source imports. It creates `group-101` as an empty community group. Every insert uses `ON CONFLICT DO NOTHING`: repeat seeds preserve administrator edits and existing settings.

Catalog descriptions, images, schedules, prices, rating fields, review counts and availability are curated source fixtures, not verified real-time provider data. The API should calculate current community rating/counts from stored reviews and clearly present ferry information as schedule guidance. Accommodation `isVerifiedPartner` is reset to false because the fixtures are not evidence of actual verification. No fabricated users, administrator, applicants, social posts or reviews are seeded. No weather readings or other live external service data are seeded; weather remains unavailable until a provider is configured.
