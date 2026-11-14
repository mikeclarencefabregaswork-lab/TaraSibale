import { pool } from "../src/db.js";
import { catalogTables, hasCatalogIdConflict } from "../src/catalog.js";
import { catalogFixtureEntries, loadCatalogFixture } from "./catalog-fixture.js";

const catalog = await loadCatalogFixture();
const entries = catalogFixtureEntries(catalog);
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('tarasibale-schema'))",
  );
  for (const { kind, data } of entries) {
    const { id } = data;
    if (await hasCatalogIdConflict(client, kind, [id])) continue;
    await client.query(
      `INSERT INTO ${catalogTables[kind]}(id, data) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, data],
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
    `Seed complete: ${entries.length} catalog entries considered; existing records preserved.`,
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
