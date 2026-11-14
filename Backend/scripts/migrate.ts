import { pool } from "../src/db.js";
import { runMigrations } from "./migration-runner.js";

const client = await pool.connect();
try {
  await client.query("BEGIN");
  const changes = await runMigrations(client);
  await client.query("COMMIT");
  for (const { name, action } of changes) console.log(`${action} ${name}`);
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
