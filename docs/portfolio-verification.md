# Portfolio mode verification — 31 October 2026

Outcome: implemented the approved portfolio presentation and collection restrictions. This is not a legal clearance or production-release certification.

| Requirement | Evidence | Result |
|---|---|---|
| Independent prototype, no unsupported official affiliation | Global notice, hero/footer, title/meta, printable/copied itinerary and GPX author source reviewed | Implemented |
| Uncleared imagery withheld without database mutation | Catalog sanitization regression plus running API: portfolioMode=true and placeholder destination image; original objects unchanged in test | Pass |
| No real account/document collection | Request tests reject writes/private reads before any database query; browser Register shows fictitious example; vault has zero file inputs | Pass |
| Existing session does not expose private data | Catalog test sends prior session cookie and verifies only resources/settings/aggregate-rating queries; session-status returns null | Pass |
| Demo travel information cannot be exported as navigation | Browser GPX and offline-navigation controls disabled; demo guide request visibly states nothing was sent; no remote images loaded on map | Pass |
| Licensed food remains credited | Rendered Culture food tab shows three food images, source links, two CC0 credits and coconut-jam CC BY-SA 4.0 credit | Pass |
| Demo chat does not send prompts | Local-only code branch and browser suggested-question response inspected; no related console errors | Pass |
| Responsive portfolio notice | Desktop 1265px client width and mobile 375px client width both matched document scroll width; screenshot inspected | Pass |
| License/asset distribution | Build generates 10 frontend runtime-package notices; unknown-rights public assets moved to ignored local archive; generated distribution excludes those old assets | Pass |

Commands: `npm test` passed (8 frontend + 14 backend tests); `npm run typecheck` passed; `npm run lint` exited 0 with two existing set-state-in-effect warnings in App and ItineraryPlanner; `npm run build` passed for frontend/backend; `git diff --check` passed.

Browser evidence used the provided in-app browser via CUA, against a temporary frontend at http://127.0.0.1:5174 and the existing local backend. Screenshots: `/tmp/tarasibale-portfolio-qa/desktop.png`, `/tmp/tarasibale-portfolio-qa/mobile.png`. The temporary server was stopped after review; the original development server/database were not intentionally stopped or replaced. A temporary frontend termination interrupted one mobile attempt; after restarting it and using a fresh tab the check succeeded. No database migrations, seeding, credential updates, registrations, bookings or document uploads were performed.

Limitations: no deployment was performed, no production hosting/privacy arrangements were verified, and no rights grants or municipal authorization were obtained. Four new request/content tests use controlled database stubs; the real local catalog was checked read-only. No database-writing integration suite was run, to preserve existing records. Full account/booking/upload behavior after explicitly opting out of portfolio mode needs separate future acceptance testing. See portfolio-release-checklist.md for remaining ownership and launch work.
