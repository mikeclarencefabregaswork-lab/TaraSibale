import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

interface SeedCatalog {
  resources: { id: string; kind: string; data: Record<string, unknown> }[];
  permissions: Record<string, boolean>;
}

const catalog = JSON.parse(
  await readFile(new URL("../seed/catalog.json", import.meta.url), "utf8"),
) as SeedCatalog;
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('tarasibale-schema'))",
  );
  for (const resource of catalog.resources) {
    await client.query(
      "INSERT INTO resources(id, kind, data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [resource.id, resource.kind, JSON.stringify(resource.data)],
    );
  }
  await client.query(
    "INSERT INTO settings(key, data) VALUES ('permissions', $1) ON CONFLICT DO NOTHING",
    [JSON.stringify(catalog.permissions)],
  );
  await client.query(
    "INSERT INTO travel_groups(id, name) VALUES ('group-101', 'Sibale Travel Community') ON CONFLICT DO NOTHING",
  );
  await client.query("COMMIT");
  console.log(
    `Seed complete: ${catalog.resources.length} resources considered; existing records preserved.`,
  );
} catch (error) {
  await client.query("ROLLBACK");
  console.error(
    "Seed failed; transaction rolled back.",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
