import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "../src/components/Hero.tsx";
import { WeatherView } from "../src/components/LiveWeather.tsx";
import { fetchWeather, hourlyOutlook, manilaTime, measurement, sectionStatus } from "../src/weather.ts";
import type { WeatherReport } from "../src/weather.ts";

const NOW = Date.parse("2026-11-08T15:30:00Z");
function report(): WeatherReport {
  const section = {
    status: "available" as const, validAt: "2026-11-08T15:30:00Z", retrievedAt: "2026-11-08T15:30:00Z",
    location: { name: "Sibale", latitude: 12.913, longitude: 121.72 }, grid: null, current: {}, hourly: [],
  };
  return { source: "Open-Meteo", weather: { ...section,
    current: { temperature_2m: 29, weather_code: 3, relative_humidity_2m: 80, wind_speed_10m: 25, wind_gusts_10m: 38 },
    hourly: [{ time: "2026-11-08T15:00:00.000Z", values: { wind_speed_10m: 25, wind_gusts_10m: 38 } }],
  }, marine: { ...section, location: { name: "Offshore west of Sibale", latitude: 12.93, longitude: 121.62 },
    current: { wave_height: 2.5, wave_period: 8, wave_direction: 45 },
    hourly: [{ time: "2026-11-08T16:00:00.000Z", values: { wave_height: 3, wave_period: 9, wave_direction: 60 } }],
  } };
}
function render(data: WeatherReport | undefined, failed = false) {
  return renderToStaticMarkup(React.createElement(WeatherView, { report: data, loading: false, failed, now: NOW, onRetry: () => {} }));
}

test("hero starts with a loading weather panel and visible ferry safety notice", () => {
  const html = renderToStaticMarkup(React.createElement(Hero, {
    setActiveTab: () => {}, onOpenAiChat: () => {}, isDarkMode: false,
  }));
  assert.match(html, /Loading weather/);
  assert.match(html, /Ferry safety not assessed/);
  assert.match(html, /Sea conditions/);
});

test("weather panel renders sea estimates, units, credits and official warnings without ferry clearance", () => {
  const html = render(report());
  assert.match(html, /29.0 °C/);
  assert.match(html, /2.5 m/);
  assert.match(html, /8.0 s/);
  assert.match(html, /38.0 km\/h/);
  assert.match(html, /Significant wave height/);
  assert.match(html, /highest third of waves/);
  assert.match(html, /individual waves can be higher/);
  assert.match(html, /One offshore model point does not cover the entire ferry crossing/);
  assert.match(html, /Ferry safety not assessed/);
  assert.match(html, /https:\/\/www.pagasa.dost.gov.ph\/marine\/gale-warning/);
  assert.match(html, /CC BY 4.0/);
  assert.doesNotMatch(html, /Safe to sail|Ferry operating|No warnings/i);
});

test("missing sea data is unavailable while weather remains visible", () => {
  const data = report();
  data.marine.status = "unavailable";
  const html = render(data);
  assert.match(html, /29.0 °C/);
  assert.match(html, /Sea data unavailable/);
  assert.doesNotMatch(html, /2.5 m/);
  assert.equal(measurement(null, "m"), "Unavailable");
  assert.equal(measurement(undefined, "m"), "Unavailable");
  assert.equal(measurement(NaN, "m"), "Unavailable");
  assert.equal(measurement(0, "m"), "0.0 m");
});

test("expired retrieval, old valid time and failed refresh withhold prior measurements", () => {
  const data = report();
  data.marine.retrievedAt = "2026-11-08T14:59:00Z";
  assert.equal(sectionStatus(data.marine, NOW), "outdated");
  let html = render(data);
  assert.match(html, /Sea data outdated/);
  assert.doesNotMatch(html, /2.5 m/);
  data.weather.validAt = "2026-11-08T12:00:00Z";
  assert.equal(sectionStatus(data.weather, NOW), "outdated");
  html = render(report(), true);
  assert.match(html, /Could not refresh/);
  assert.doesNotMatch(html, /29.0 °C|2.5 m/);
  data.weather.validAt = "invalid";
  assert.equal(sectionStatus(data.weather, NOW), "unavailable");
});

test("24-hour outlook aligns by timestamp across midnight and preserves missing values", () => {
  const rows = hourlyOutlook(report(), NOW);
  assert.equal(rows.length, 24);
  assert.equal(rows[0].time, "2026-11-08T15:00:00.000Z");
  assert.equal(rows[0].wind, 25);
  assert.equal(rows[0].height, undefined);
  assert.equal(rows[1].height, 3);
  assert.equal(rows[1].wind, undefined);
  assert.match(manilaTime(rows[1].time), /Nov 9/);
  assert.match(manilaTime(rows[0].time), /11:00 pm/i);
  assert.ok(hourlyOutlook(report(), NOW, true).every(row => row.height === undefined && row.wind === undefined));
});

test("first-load failure retains the safety notice and an enabled retry control", () => {
  const html = render(undefined, true);
  assert.match(html, /Weather unavailable/);
  assert.match(html, /Ferry safety not assessed/);
  assert.match(html, /Refresh weather<\/button>/);
  assert.doesNotMatch(html, /<button[^>]*\sdisabled(?:[=\s>])/);
});

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
test("weather loader accepts the API contract and rejects HTTP and malformed responses", async () => {
  globalThis.fetch = async () => Response.json(report());
  assert.deepEqual(await fetchWeather(new AbortController().signal), report());
  globalThis.fetch = async () => new Response("down", { status: 503 });
  await assert.rejects(fetchWeather(new AbortController().signal), /unavailable/);
  globalThis.fetch = async () => Response.json({ weather: null });
  await assert.rejects(fetchWeather(new AbortController().signal), /Invalid weather response/);
});

test("malformed grid coordinates are rejected before rendering the weather cards", async () => {
  const data = report();
  const malformed = { ...data, marine: { ...data.marine, grid: { latitude: "bad", longitude: null } } };
  globalThis.fetch = async () => Response.json(malformed);
  await assert.rejects(fetchWeather(new AbortController().signal), /Invalid weather response/);
});
