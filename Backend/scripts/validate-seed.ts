import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

interface Resource {
  id: string;
  kind: string;
  data: Record<string, unknown>;
}
const catalog = JSON.parse(
  await readFile(new URL("../seed/catalog.json", import.meta.url), "utf8"),
) as { resources: Resource[] };
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('tarasibale-schema'))",
  );
  for (const [index, resource] of catalog.resources.entries()) {
    const id = `seed-validation-${index}`;
    await client.query(
      "INSERT INTO resources(id,kind,data) VALUES ($1,$2,$3)",
      [id, resource.kind, JSON.stringify({ ...resource.data, id })],
    );
  }
  const trail = catalog.resources.find((resource) => resource.kind === "trail");
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
      const id = `invalid-seed-trail-${index}`;
      await client.query(
        "INSERT INTO resources(id,kind,data) VALUES ($1,$2,$3)",
        [id, "trail", JSON.stringify({ ...trail.data, id, coordinates })],
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
    `Validated ${catalog.resources.length} seed resources and 4 invalid coordinate cases; all writes rolled back.`,
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
