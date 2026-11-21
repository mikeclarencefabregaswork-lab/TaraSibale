// Match the primary navigation order, then the additional island tools.
export const PAGE_ORDER = [
  "explore", "itinerary", "map", "stay", "guide", "group", "travel",
  "documents", "social", "reviews", "admin", "auth", "login", "signup",
];

export function pageSlideDirection(from: string, to: string): -1 | 0 | 1 {
  const previous = PAGE_ORDER.indexOf(from);
  const next = PAGE_ORDER.indexOf(to);
  if (previous < 0 || next < 0 || previous === next) return 0;
  return next > previous ? 1 : -1;
}
