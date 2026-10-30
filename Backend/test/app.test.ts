import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import { createApp } from "../src/app.js";

async function get(path: string, checkDatabase: () => Promise<void>) {
  const server = createApp(checkDatabase).listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeIdleConnections();
    });
  }
}

test("liveness succeeds without a database connection", async () => {
  const result = await get("/api/health", async () => {
    throw new Error("Database offline");
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: "ok" });
});

test("readiness succeeds when the database responds", async () => {
  const result = await get("/api/health/db", async () => {});
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: "ok", database: "connected" });
});

test("readiness returns 503 without exposing database error details", async () => {
  const result = await get("/api/health/db", async () => {
    throw new Error("postgresql://secret:password@private-host/database");
  });
  assert.equal(result.status, 503);
  assert.deepEqual(result.body, { status: "error", database: "unavailable" });
});

test("unknown routes return a JSON 404", async () => {
  const result = await get("/api/missing", async () => {});
  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { error: "Not found" });
});
