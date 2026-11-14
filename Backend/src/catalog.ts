import type { PoolClient } from "pg";

export const catalogTables = {
  attraction: "attractions",
  accommodation: "accommodations",
  ferry: "ferry_routes",
  culture: "culture_items",
  trail: "hiking_trails",
} as const;

export type CatalogKind = keyof typeof catalogTables;

export function isCatalogKind(kind: string): kind is CatalogKind {
  return Object.hasOwn(catalogTables, kind);
}

export const catalogKinds = Object.keys(catalogTables).filter(isCatalogKind);

export const activeCatalogEntry = "data->>'isArchived' IS DISTINCT FROM 'true'";

export function catalogEntries() {
  return catalogKinds
    .map((kind) => `SELECT id, '${kind}' AS kind, data FROM ${catalogTables[kind]} WHERE ${activeCatalogEntry}`)
    .join(" UNION ALL ");
}

// The HTTP contract identifies catalog entries by ID alone. Catalog writes
// check sibling tables under the same transaction lock as migrations and seeds.
export async function hasCatalogIdConflict(
  client: PoolClient,
  kind: CatalogKind,
  ids: string[],
) {
  if (!ids.length) return false;
  const lookups = catalogKinds
    .filter((otherKind) => otherKind !== kind)
    .map((otherKind) => `SELECT 1 FROM ${catalogTables[otherKind]} WHERE id=ANY($1::text[])`)
    .join(" UNION ALL ");
  const { rows } = await client.query<{ conflict: boolean }>(
    `SELECT EXISTS (${lookups}) AS conflict`,
    [ids],
  );
  return rows[0]!.conflict;
}
