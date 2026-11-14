import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { Pool } from "pg";
import { createApp } from "../src/app.js";
import { portfolioCatalog } from "../src/portfolio.js";

test("portfolio boundary blocks collection and private reads before querying storage", async () => {
  let queries = 0;
  const database = { query: () => { queries++; throw new Error("Database must not be queried"); } } as unknown as Pool;
  const server = createApp(async () => {}, database, { portfolioMode: true }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  try {
    for (const [method, path] of [["POST", "/auth/signup"], ["POST", "/auth/login"], ["POST", "/bookings"], ["PUT", "/user-state"], ["POST", "/social-posts"], ["GET", "/user-state"], ["GET", "/admin/permissions"], ["GET", "/bookings"], ["GET", "/social-posts/test/image"]]) {
      const response = await fetch(base + path, { method, headers: { Cookie: `tarasibale_session=${"a".repeat(64)}` } });
      assert.equal(response.status, 403, `${method} ${path}`);
      assert.match((await response.json()).error, /portfolio/i);
    }
    assert.equal((await fetch(base + "/social-posts/test/image", { method: "HEAD" })).status, 403);
    assert.deepEqual(await (await fetch(base + "/auth/me")).json(), null);
    assert.deepEqual(await (await fetch(base + "/reviews")).json(), []);
    assert.equal(queries, 0);
  } finally {
    server.closeIdleConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

test("portfolio catalog preserves photos, galleries and credits while withholding contacts and public contributions without changing stored data", () => {
  const source = { attractions: [{ image: "https://example.com/photo.jpg", gallery: ["https://example.com/other.jpg"], photoCredit: { usage: "local-preview" } }], hikingTrails: [{ name: "Island trek", image: "https://example.com/trail.jpg" }], cultureItems: [{ image: "/assets/food/coconut-jam.jpg", photoCredit: { license: "CC BY-SA 4.0" } }], socialPosts: [{ name: "Private contributor" }], ferryRoutes: [{ name: "Example boat", phone: "+63 917 555 7422" }] };
  const original = structuredClone(source);
  const result = portfolioCatalog(source) as typeof source;
  assert.deepEqual(source, original);
  assert.equal(result.attractions[0]!.image, source.attractions[0]!.image);
  assert.deepEqual(result.attractions[0]!.gallery, source.attractions[0]!.gallery);
  assert.deepEqual(result.attractions[0]!.photoCredit, source.attractions[0]!.photoCredit);
  assert.equal(result.hikingTrails[0]!.image, source.hikingTrails[0]!.image);
  assert.equal(result.cultureItems[0]!.image, "/assets/food/coconut-jam.jpg");
  assert.equal(result.cultureItems[0]!.photoCredit.license, "CC BY-SA 4.0");
  assert.deepEqual(result.socialPosts, []);
  assert.match(result.hikingTrails[0]!.name, /^Sample:/);
  assert.doesNotMatch(JSON.stringify(result), /\+63/);
});

test("portfolio catalog ignores pre-existing session cookies and never reads public contributions", async () => {
  const queries: string[] = [];
  const database = { query: async (sql: string) => {
    queries.push(sql);
    if (sql.includes("FROM attractions")) return { rows: [{ id: "beach-1", kind: "attraction", data: { name: "Beach", image: "https://example.com/uncleared.jpg" } }] };
    if (sql.includes("FROM settings") || sql.includes("FROM reviews")) return { rows: [] };
    throw new Error("Unexpected query: " + sql);
  } } as unknown as Pool;
  const server = createApp(async () => {}, database, { portfolioMode: true }).listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/catalog`, { headers: { Cookie: `tarasibale_session=${"a".repeat(64)}` } });
    assert.equal(response.status, 200);
    const catalog = await response.json();
    assert.equal(catalog.portfolioMode, true);
    assert.equal(catalog.attractions[0].image, "https://example.com/uncleared.jpg");
    assert.deepEqual(catalog.socialPosts, []);
    assert.equal(queries.length, 3);
    assert.ok(queries.every(sql => !/sessions|social_posts|user_state|bookings/.test(sql)));
  } finally {
    server.closeIdleConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

test("explicit local opt-out preserves the original validation route", async () => {
  const database = { query: () => { throw new Error("Invalid signup should not query storage"); } } as unknown as Pool;
  const server = createApp(async () => {}, database, { portfolioMode: false }).listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 400);
  } finally {
    server.closeIdleConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
