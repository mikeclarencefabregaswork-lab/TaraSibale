# Live Weather Implementation Plan

> Execute inline with superpowers:executing-plans and test-driven development.

**Goal:** Deliver island weather and nearby offshore wave estimates without implying ferry clearance.
**Architecture:** Express owns two independent, validated upstream results and a five-minute single-flight cache. A dedicated React component owns fetching, retry, expiry, and an expandable forecast panel.
**Tech Stack:** Existing TypeScript, Express, Zod, React, node:test; no new dependencies.
**Spec:** ../specs/2026-11-08-live-weather-design.md

## Global constraints

Preserve portfolio defaults, all private/mutation restrictions, stored data, and unrelated Header work. No commits, deployment, or AI credentials needed. Fixed coordinates only; no client-controlled upstream URLs. Model estimates never establish travel safety.

## Review focus

1. Null and malformed measurements must not become zero.
2. Provider failures and timeouts stay independent.
3. Old current times and expired browser results must not look current.
4. Forecast timestamps must align across providers and display Manila dates across midnight.
5. Portfolio mode must allow GET/HEAD weather while denying mutations/private reads.

## Task 1: Backend service and public read seam

Files: Backend/src/weather.ts, Backend/src/api.ts, Backend/src/app.ts, Backend/test/weather.test.ts.
Interface: createWeatherService({fetch?, now?, timeoutMs?}) returns an async cached loader. Response has weather/marine sections with status, retrievedAt, validAt, location, current numeric/null fields and hourly time/value rows.
- [x] Demonstrate failing portfolio GET weather regression; cover nulls, timestamps, partial outage, timeout, cache expiry and concurrent deduplication.
- [x] Implement fixed island weather and offshore marine queries; validate units/times/numbers, expose requested and returned grid coordinates, bound requests to eight seconds, cache failures briefly and successes five minutes.
- [x] Run focused backend tests, then root tests; require zero failures.

## Task 2: Weather panel

Files: Frontend/src/components/LiveWeather.tsx, Frontend/src/weather.ts, Frontend/src/components/Hero.tsx, Frontend/test/weather.test.ts.
Consumes backend DTO through GET /api/weather. Produces summary, expandable details, accessible retry, 24 hourly rows aligned by UTC timestamp and formatted in Asia/Manila.
- [x] Demonstrate failing hero-loading and malformed-grid regressions; cover success, partial outage, stale data, null values, failure and timestamp alignment.
- [x] Implement panel, 15-minute polling and manual retry; abort on unmount, expire old data, use no background error toasts.
- [x] Show significant-wave explanation, offshore coverage limits, source credits, ferry safety not assessed and official advisory links.
- [x] Run focused frontend tests and root tests; require zero failures.

## Task 3: Runtime and regression verification

Files: README.md and weather usage documentation.
- [x] Run npm run typecheck, npm run lint, npm test, npm run test:integration, npm run build.
- [x] Check real upstream requests and local endpoint, then browser loading, expansion, retry, mobile layout and unavailable states where supported.
- [x] Review final diff and obtain independent whole-change review; fix material findings and rerun affected checks.

## Execution record

Baseline root unit tests passed. Branch codex/live-weather created; work remains in the current checkout to preserve the user’s existing changes. No worktree or commit required for this bounded change. Native inline execution follows the user’s implementation approval without another planning approval round.


### Verification record

- Portfolio read regression failed with 403 before the route allowlist change, then passed.
- Hero loading regression failed against the static unavailable placeholder, then passed.
- Malformed grid regression failed with a missing rejection, then passed after response-envelope validation.
- Final root checks: typecheck passed; lint passed with two existing set-state-in-effect warnings in App.tsx and ItineraryPlanner.tsx; unit tests 39/39 passed; PostgreSQL integration tests 21/21 passed; production build passed; git diff --check passed.
- Live provider connectivity verified with both weather and marine sections available. Existing local app rendered actual estimates, Manila times and 24 hourly rows; expansion and manual refresh worked. At 390px the document stayed 390px wide while the 660px forecast table scrolled inside its 265px container. Viewport override restored. Browser error log was empty.
- Independent reviewer found no important actionable issues. Its suggested defensive grid check was added and tested. Automated hook polling/unmount/timer simulation was not performed; actual mounted fetch and manual refresh were checked in the browser. Unavailable/outdated render states were checked with deterministic tests.
- BrowserAct CLI was absent; used the available CUA browser connection to the existing local app. No dependencies installed.
- User-owned Header changes/test preserved. Changes are uncommitted on codex/live-weather; no push, merge, or deployment performed.
