import { readdir, readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

// One transaction for discovery, history, DDL and history inserts. The lock is
// shared by seed.ts so concurrent startup commands cannot race on schema/data.
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('tarasibale-schema'))",
  );
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const directory = new URL("../migrations/", import.meta.url);
  const names = (await readdir(directory))
    .filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name))
    .sort();
  if (names.length === 0) throw new Error("No migration files found.");
  const applied = new Set(
    (
      await client.query<{ version: string }>(
        "SELECT version FROM schema_migrations",
      )
    ).rows.map((row) => row.version),
  );
  for (const name of names) {
    if (applied.has(name)) continue;
    await client.query(await readFile(new URL(name, directory), "utf8"));
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [
      name,
    ]);
    console.log(`Applied ${name}`);
  }
  await client.query("COMMIT");
  console.log("Database migrations are current.");
} catch (error) {
  await client.query("ROLLBACK");
  // Avoid logging connection URLs or query parameters in tooling failures.
  console.error(
    "Migration failed; transaction rolled back.",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
