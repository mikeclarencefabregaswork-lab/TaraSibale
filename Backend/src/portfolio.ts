/** Presentation copy only: stored records and their provenance stay untouched. */
export function portfolioCatalog(value: Record<string, unknown>): Record<string, unknown> {
  const clean = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(clean);
    if (!item || typeof item !== "object") {
      return typeof item === "string"
        ? item.replace(/\+63[\d\s()-]{9,}/g, "Contact withheld in portfolio demo")
        : item;
    }
    const source = item as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, data] of Object.entries(source)) {
      result[key] = clean(data);
    }
    return result;
  };
  const result = clean(value) as Record<string, unknown>;
  result.socialPosts = [];
  for (const key of ["hikingTrails", "ferryRoutes"]) {
    if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: Record<string, unknown>) => ({
        ...item,
        name: `Sample: ${item.name ?? "travel record"}`,
      }));
    }
  }
  result.portfolioMode = true;
  return result;
}
