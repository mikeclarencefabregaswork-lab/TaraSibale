# Motion, loading and action feedback

Keep the oceanic theme, page layouts, API contracts and account isolation. Implement inline under the user's instruction to proceed.

1. Add a shared toast store and accessible viewport: bounded queue, duplicate suppression, dismiss controls, independent expiry, pause while hovered/focused. Test queue and error feedback through stable public seams. Success must follow the completed action; autosave feedback must follow persistence.
2. Add page-shaped skeletons for real catalog/account requests and lazy modules. Keep authentication usable while catalog data loads; failures must show an error rather than an endless skeleton. Retain existing attraction/stay skeletons.
3. Add short page, card, dialog and control animations through shared CSS. Respect reduced-motion preferences, avoid animating map internals, and preserve focus/interaction semantics.
4. Connect auth, refresh, booking, reviews, community posts/messages, admin updates, local/account saves, downloads and connectivity feedback. Replace duplicate ad-hoc toast timers.
5. Verify build, lint, frontend tests, and browser flows: pending and failed requests, navigation, action success/error, toast dismissal/expiry, mobile layout, dark mode and reduced motion. Do not mutate the user's account to test authenticated actions; intercept requests in an isolated test browser where needed.
