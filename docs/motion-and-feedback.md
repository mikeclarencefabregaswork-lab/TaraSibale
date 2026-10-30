# Motion, loading and feedback

The oceanic interface shares motion rules in `Frontend/src/motion.css`: short page entrances, content arrival after loading, card hover lift, button press feedback, dialog entrances and toast entrances. Existing fade/slide classes now have definitions. Map internals do not receive card animation. `prefers-reduced-motion: reduce` minimizes animation and transitions, disables hover lift/press scaling and stops decorative loops, including skeleton shimmer.

`PageSkeleton` provides page-shaped placeholders for real catalog/account loading and lazy-module loading. Explore and Stays reuse the existing card skeletons; Map has a map-shaped placeholder; other sections show heading and content placeholders. Authentication remains usable during catalog loading. Request failures leave an error and retry path instead of an endless skeleton. Background refresh keeps existing content where possible. There is no artificial loading delay.

`toastStore.ts` and `ToastViewport.tsx` provide a shared queue capped at four visible messages. Identical live messages are deduplicated. Each toast has its own expiry (5.5 seconds normally, 9 seconds for errors), dismiss control and screen-reader status/alert role. Hovering or keyboard focus pauses expiry; leaving restarts its duration. The viewport persists across page navigation and sits above dialogs.

Feedback is connected to:

- Auth success/sign-out, server-confirmed review/booking/community actions, and admin saves.
- API failures, catalog refresh, and browser connection loss/restoration.
- Favorites, accurately identified as temporary for the current visit.
- Document/checklist/itinerary persistence, only after local storage succeeds or the account write returns. Notification-only autosaves do not trigger a save toast.
- Clipboard copy after success, clipboard failures, document/calendar download initiation, and browser audio unavailability.

Inline form errors and persistent API error banners remain available after toasts disappear. A toast does not replace a reservation voucher or change booking availability. The existing reference-only sourced lodgings still cannot be booked.

Verification: frontend tests cover queue bounds, deduplication, unsubscribe/dismissal and rejected-action error notification. Isolated Playwright/Edge checks cover 13 routes, delayed/failed requests, skeleton removal, guest document persistence, favorites, mocked sign-in failure, toast pause/expiry/dismissal, mobile light/dark modes and reduced motion. Browser plugin is not available; Playwright is the fallback. Authenticated production writes were not performed during browser QA.
