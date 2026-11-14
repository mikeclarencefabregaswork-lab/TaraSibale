import { readFile } from "node:fs/promises";
import { catalogKinds, type CatalogKind } from "../src/catalog.js";

type CatalogItem = Record<string, unknown> & { id: string };
type SeedCatalog = Record<CatalogKind, CatalogItem[]> & {
  permissions: Record<string, boolean>;
};

export async function loadCatalogFixture() {
  return JSON.parse(
    await readFile(new URL("../seed/catalog.json", import.meta.url), "utf8"),
  ) as SeedCatalog;
}

export function catalogFixtureEntries(catalog: SeedCatalog) {
  return catalogKinds.flatMap((kind) =>
    catalog[kind].map((data) => ({ kind, data })),
  );
}
