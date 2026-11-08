import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FiestasAndCustoms } from "../src/components/FiestasAndCustoms.tsx";
import { CULTURE_ITEMS } from "../src/data/concepcionData.ts";

const barangays = ["Bachawan", "Calabasahan", "Dalajican", "Masadya", "Masudsud", "Poblacion", "Sampong", "San Pedro", "San Vicente"];

test("fiesta directory covers all nine PSA barangays without inventing dates or patrons", () => {
  const directory = CULTURE_ITEMS.filter(item => item.category === "fiesta-directory");
  assert.deepEqual(directory.map(item => item.barangay).sort(), barangays);
  assert.equal(new Set(directory.map(item => item.id)).size, 9);
  for (const item of directory) {
    assert.equal(item.dateLabel, "To be confirmed");
    assert.equal(item.patronSaint, null);
    assert.equal(item.image, undefined);
    assert.match(item.evidenceLabel ?? "", /fiesta details unconfirmed/i);
    assert.match(item.sources?.[0]?.title ?? "", /names only/i);
  }
  assert.equal(CULTURE_ITEMS.filter(item => item.category === "event").length, 1);
  assert.match(CULTURE_ITEMS.find(item => item.id === "culture-event-immaculate-conception")?.dateLabel ?? "", /December 8/);
  assert.equal(CULTURE_ITEMS.filter(item => item.category === "tradition").length, 2);
});

test("fiestas view includes a barangay directory in addition to documented celebrations", () => {
  const html = renderToStaticMarkup(React.createElement(FiestasAndCustoms, { cultureItems: CULTURE_ITEMS }));
  assert.match(html, /Barangay Fiestas/);
  assert.match(html, /Town Fiesta &amp; Documented Customs/);
  for (const name of barangays) assert.match(html, new RegExp(`<h3[^>]*>${name}</h3>`));
  assert.equal((html.match(/<dt[^>]*>Fiesta date<\/dt>/g) ?? []).length, 9);
  assert.equal((html.match(/<dt[^>]*>Patron saint<\/dt>/g) ?? []).length, 9);
  assert.equal((html.match(/>To be confirmed<\/dd>/g) ?? []).length, 18);
  assert.match(html, /confirms barangay names only/);
  assert.match(html, /December 8/);
  assert.match(html, /Biniray &amp; Parish Processions/);
  assert.match(html, /Fiesta Hospitality &amp; Community Gatherings/);
  assert.doesNotMatch(html, /<img|Native-speaker|Leche Flan/);
});

test("frontend, canonical seed and migration publish the same directory records", async () => {
  const source = JSON.parse(await readFile(new URL("../../Backend/seed/barangay-fiestas.json", import.meta.url), "utf8"));
  const catalog = JSON.parse(await readFile(new URL("../../Backend/seed/catalog.json", import.meta.url), "utf8"));
  const migration = await readFile(new URL("../../Backend/migrations/010_barangay_fiesta_directory.sql", import.meta.url), "utf8");
  const embedded = migration.match(/\$barangays\$([\s\S]*?)\$barangays\$/)?.[1];
  assert.ok(embedded, "Migration must contain its immutable directory snapshot");
  assert.deepEqual(JSON.parse(embedded), source);
  assert.deepEqual(CULTURE_ITEMS.filter(item => item.category === "fiesta-directory"), source);
  assert.deepEqual(catalog.resources.filter((item: { data: { category: string } }) => item.data.category === "fiesta-directory")
    .map((item: { data: unknown }) => item.data), source);
});
