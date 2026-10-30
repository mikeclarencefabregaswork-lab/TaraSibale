import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Copy Backend/.env.example to Backend/.env and configure PostgreSQL.",
  );
}

export const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 3000,
  query_timeout: 3000,
  statement_timeout: 3000,
  max: 10,
});

pool.on("error", () => {
  console.error("An idle PostgreSQL connection failed.");
});

export async function checkDatabase(): Promise<void> {
  await pool.query("SELECT 1");
}
