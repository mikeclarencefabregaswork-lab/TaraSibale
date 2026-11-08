import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Pool } from "pg";
import { test } from "node:test";
import { createApp } from "../src/app.js";
import { createWeatherService } from "../src/weather.js";

const NOW = Date.parse("2026-11-08T00:30:00Z");
function fixture(marine: boolean, time = NOW / 1000) {
  const current = marine
    ? { wave_height: 2.4, wave_period: 8.5, wave_direction: 45 }
    : { temperature_2m: 29.5, relative_humidity_2m: 82, weather_code: 3, wind_speed_10m: 24, wind_gusts_10m: 40 };
  const units = marine
    ? { wave_height: "m", wave_period: "s", wave_direction: "°" }
    : { temperature_2m: "°C", relative_humidity_2m: "%", weather_code: "wmo code", wind_speed_10m: "km/h", wind_gusts_10m: "km/h" };
  return {
    latitude: marine ? 12.9 : 12.913, longitude: marine ? 121.6 : 121.72,
    current: { time, ...current }, current_units: units, hourly_units: units,
    hourly: {
      time: [NOW / 1000 - 5400, NOW / 1000 - 1800, NOW / 1000 + 1800, NOW / 1000 + 90000],
      wave_height: [99, 2.4, 2.8, 99], wave_period: [8, 8.5, 9, 8], wave_direction: [45, 45, 50, 50],
      wind_speed_10m: [99, 24, 30, 99], wind_gusts_10m: [99, 40, 45, 99],
    },
  };
}
const upstream = (url: string | URL | Request) => String(url).includes("marine-api");

test("weather service normalizes units, grid coordinates and the next 24 hourly timestamps", async () => {
  const load = createWeatherService({ now: () => NOW, fetch: async url => Response.json(fixture(upstream(url))) });
  const report = await load();
  assert.equal(report.weather.status, "available");
  assert.equal(report.weather.current.temperature_2m, 29.5);
  assert.equal(report.marine.current.wave_height, 2.4);
  assert.deepEqual(report.marine.grid, { latitude: 12.9, longitude: 121.6 });
  assert.equal(report.marine.validAt, "2026-11-08T00:30:00.000Z");
  assert.deepEqual(report.marine.hourly.map(row => row.time), ["2026-11-08T00:00:00.000Z", "2026-11-08T01:00:00.000Z"]);
  assert.equal(report.marine.hourly[1]?.values.wave_height, 2.8);
});

test("missing, negative and wrong-unit measurements never become calm seas", async () => {
  const load = createWeatherService({ now: () => NOW, fetch: async url => {
    const data = fixture(upstream(url));
    if (upstream(url)) {
      Object.assign(data.current, { wave_height: null, wave_period: -1 });
      Object.assign(data.current_units, { wave_direction: "radians" });
      Object.assign(data.hourly, { wave_height: [null, null], wave_period: [] });
    }
    return Response.json(data);
  } });
  const report = await load();
  assert.equal(report.weather.status, "available");
  assert.equal(report.marine.status, "unavailable");
  assert.deepEqual(report.marine.current, { wave_height: null, wave_period: null, wave_direction: null });
  assert.equal(report.marine.hourly[0]?.values.wave_height, null);
  assert.equal(report.marine.hourly[1]?.values.wave_period, null);
});

test("stale and future current times are not advertised as current", async () => {
  const load = createWeatherService({ now: () => NOW, fetch: async url =>
    Response.json(fixture(upstream(url), (NOW + (upstream(url) ? -3 : 1) * 3_600_000) / 1000)) });
  const report = await load();
  assert.equal(report.marine.status, "outdated");
  assert.equal(report.weather.status, "unavailable");
});

test("marine HTTP, malformed payload and timeout failures preserve weather", async () => {
  for (const kind of ["http", "invalid", "timeout"]) {
    const load = createWeatherService({ now: () => NOW, timeoutMs: 10, fetch: async url => {
      if (!upstream(url)) return Response.json(fixture(false));
      if (kind === "http") return new Response("down", { status: 503 });
      if (kind === "invalid") return Response.json({ latitude: "bad" });
      return new Promise<Response>(() => {});
    } });
    const report = await load();
    assert.equal(report.marine.status, "unavailable", kind);
    assert.equal(report.weather.current.temperature_2m, 29.5, kind);
    assert.equal(report.weather.status, "available", kind);
    assert.equal(report.marine.retrievedAt, null, kind);
  }
});

test("concurrent readers share requests and refresh after the five-minute cache expires", async () => {
  let time = NOW;
  let calls = 0;
  const load = createWeatherService({ now: () => time, fetch: async url => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.searchParams.get("timeformat"), "unixtime");
    assert.equal(parsed.searchParams.get("forecast_hours"), "25");
    return Response.json(fixture(upstream(url), time / 1000));
  } });
  const reports = await Promise.all([load(), load(), load()]);
  assert.equal(calls, 2);
  assert.deepEqual(reports[0], reports[2]);
  time += 299_999;
  assert.equal((await load()).weather.retrievedAt, "2026-11-08T00:30:00.000Z");
  time += 1;
  assert.equal((await load()).weather.retrievedAt, "2026-11-08T00:35:00.000Z");
  assert.equal(calls, 4);
});

test("provider outages are retried after a short cache rather than on every visitor", async () => {
  let time = NOW;
  let failed = true;
  const load = createWeatherService({ now: () => time, fetch: async url =>
    failed ? new Response("down", { status: 429 }) : Response.json(fixture(upstream(url), time / 1000)) });
  assert.equal((await load()).marine.status, "unavailable");
  failed = false;
  time += 29_999;
  assert.equal((await load()).marine.status, "unavailable");
  time++;
  assert.equal((await load()).marine.status, "available");
});

test("portfolio permits read-only weather without touching storage", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("Provider unavailable", { status: 503 });
  const database = { query: () => { throw new Error("Weather must not use storage"); } } as unknown as Pool;
  const server = createApp(async () => {}, database).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/weather`;
  try {
    const response = await originalFetch(base);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.weather.status, "unavailable");
    assert.equal(body.marine.status, "unavailable");
    assert.equal((await originalFetch(base, { method: "HEAD" })).status, 200);
    assert.equal((await originalFetch(base, { method: "POST" })).status, 403);
  } finally {
    globalThis.fetch = originalFetch;
    server.closeIdleConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
