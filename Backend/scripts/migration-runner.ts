import { readdir, readFile } from "node:fs/promises";
import type { PoolClient } from "pg";

const baseline = "012_baseline.sql";
const history = new URL("../migration-history/", import.meta.url);
const current = new URL("../migrations/", import.meta.url);

async function migrationNames(directory: URL) {
  return (await readdir(directory))
    .filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name))
    .sort();
}

// The caller owns the transaction, including rollback if any step fails.
export async function runMigrations(client: PoolClient) {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('tarasibale-schema'))",
  );
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const applied = new Set(
    (
      await client.query<{ version: string }>(
        "SELECT version FROM schema_migrations",
      )
    ).rows.map(({ version }) => version),
  );
  const names = await migrationNames(current);
  if (!names.includes(baseline)) throw new Error("Schema baseline is missing");

  const changes: { name: string; action: "Applied" | "Recorded" }[] = [];
  async function record(name: string, directory?: URL) {
    if (applied.has(name)) return;
    if (directory) await client.query(await readFile(new URL(name, directory), "utf8"));
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [name]);
    changes.push({ name, action: directory ? "Applied" : "Recorded" });
  }

  if (!applied.has(baseline)) {
    if (applied.size === 0) {
      await record(baseline, current);
    } else {
      for (const name of await migrationNames(history)) await record(name, history);
      // A legacy install already has the baseline schema after the upgrade.
      await record(baseline);
    }
  }
  for (const name of names) {
    if (name > baseline) await record(name, current);
  }
  return changes;
}
