# Split catalog implementation plan

**Goal:** Move all catalog content, including archived records, into the five existing content domains and remove the `resources` table.

**Architecture:** Keep checked JSONB payloads in separate PostgreSQL tables so optional fields, publication state, and API responses are preserved. Use direct foreign keys for bookings and typed reviews. Preserve the old untyped ID contract for app-managed catalog writes. A shared table of catalog identities would provide database-wide ID uniqueness but introduces a central dependency; the separate tables can instead use their own primary keys and serialize catalog writes that check for ID conflicts.

**Constraints:** Keep migrations 001–010 immutable, preserve portfolio mode, and verify against disposable PostgreSQL before touching the configured database.

- Add an integration check that exercises migration 011 on preexisting data, including edited culture, archived attractions, bookings and historical reviews. Assert that the old table is gone and FK restrictions still protect history.
- Add 011, retaining the existing database checks and moving references before dropping the old table in the migration transaction.
- Switch the API, seeds and seed validator to the new tables. Keep the HTTP contract and reject cross-category ID conflicts through admin writes. Preserve the booking row lock.
- Update database and architecture notes. Run typecheck, lint, unit tests, build, integration tests and a disposable migrate/seed/validate smoke test.
