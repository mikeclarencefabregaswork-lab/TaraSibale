import { pool } from "../src/db.js";

const email = process.argv[2]?.trim();
try {
  if (!email || process.argv.length !== 3)
    throw new Error("Usage: npm run admin:promote -- <existing-account-email>");
  const result = await pool.query<{ id: string }>(
    "UPDATE users SET role = 'admin', is_verified = true WHERE lower(email) = lower($1) RETURNING id",
    [email],
  );
  if (result.rowCount !== 1)
    throw new Error(
      "No existing account matches that email. Create the account through signup first.",
    );
  console.log(
    `Administrator role granted to existing account ${result.rows[0]!.id}.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Admin promotion failed.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
