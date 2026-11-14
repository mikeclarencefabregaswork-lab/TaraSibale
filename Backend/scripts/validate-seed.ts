import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../src/db.js";
import { catalogTables } from "../src/catalog.js";
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
    const id = randomUUID();
    await client.query(
      `INSERT INTO ${catalogTables[kind]}(id,data) VALUES ($1,$2)`,
      [id, { ...data, id }],
    );
  }
  const [trail] = catalog.trail;
  assert.ok(trail, "Seed must exercise trail coordinate validation");
  for (const [index, coordinates] of [
    [[12]],
    [[12, 121, 5]],
    [["bad", 121]],
    [12, 121],
  ].entries()) {
    await client.query("SAVEPOINT invalid_coordinates");
    let rejected = false;
    try {
      const id = randomUUID();
      await client.query(
        "INSERT INTO hiking_trails(id,data) VALUES ($1,$2)",
        [id, { ...trail, id, coordinates }],
      );
    } catch (error) {
      if ((error as { code?: string }).code !== "23514") throw error;
      rejected = true;
    } finally {
      await client.query("ROLLBACK TO SAVEPOINT invalid_coordinates");
    }
    assert.equal(
      rejected,
      true,
      `Malformed trail coordinates case ${index} must fail CHECK`,
    );
  }
  console.log(
    `Validated ${entries.length} catalog entries and 4 invalid coordinate cases; all writes rolled back.`,
  );
} catch (error) {
  console.error(
    "Seed validation failed.",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  await client.query("ROLLBACK");
  client.release();
  await pool.end();
}
