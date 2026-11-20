# Modern Web Follow-up Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the authorized audit follow-up in this session.

**Goal:** Resolve the eight accepted audit findings without changing portfolio restrictions.

**Architecture:** Keep the existing stack. Extract theme and browser preference handling, use native modal semantics, and defer secondary feature modules.

**Tech Stack:** React, TypeScript, Vite, Tailwind, Express, Playwright, node:test.

**Spec:** docs/superpowers/specs/2026-11-20-modern-web-followup-design.md

## Global Constraints

- Preserve default portfolio restrictions and existing API contracts.
- No new runtime dependencies, database changes, deployment, or commits.
- Work on local branch codex/modern-web-followup in the user's workspace.

## Review Focus

- Storage getters throwing during startup or preference reset.
- Escape, focus return, backdrop interaction and long dialog content.
- System preference changing after an explicit override and storage events from another tab.
- Skip links interacting with hash-based view navigation and lazy content.
- Full-mode forms remaining accessible while portfolio mode stays blocked.

## Task 1: Browser behavior and native dialogs

Files: tarasibale-test/smoke.spec.ts, Frontend/src/components/AuthModal.tsx, Frontend/src/index.css.

- [x] Add and run failing account-dialog keyboard/focus regressions.
- [x] Use native dialog lifecycle and backdrop dismissal with a visible close control.
- [x] Verify the regressions in a real browser.

## Task 2: Theme and navigation

Files: Frontend/src/theme.ts, Frontend/src/App.tsx, Frontend/src/components/Header.tsx, Frontend/index.html, Frontend/src/theme.css, browser and frontend tests.

- [x] Add failing tests for blocked storage, system theme transitions, explicit choices, and navigation.
- [x] Implement guarded storage, theme synchronization and a three-option settings control.
- [x] Add a skip link, content focus/title transitions, and keyboard-operable home link.
- [x] Verify behavior through browser regressions and workspace unit tests.

## Task 3: Forms and IME

Files: AuthModal.tsx, AuthPage.tsx, AdminPage.tsx, Frontend/src/keyboard.ts, frontend tests.

- [x] Add failing full-mode markup and IME boundary tests.
- [x] Associate labels/inputs, add autocomplete, and name password toggles; gate custom Enter handling on native composition state.
- [x] Run affected tests.

## Task 4: Loading and CI

Files: Hero.tsx, BookingSection.tsx, App.tsx, Frontend/index.html, playwright.config.ts, .github/workflows/playwright.yml, README.md.

- [x] Add image delivery regressions and verify the existing bundle baseline.
- [x] Add responsive hero delivery and deferred secondary UI with loading fallbacks.
- [x] Extend CI to all workspace checks and desktop/mobile browser projects.
- [x] Run typecheck, lint, unit, integration, build and browser suites; compare bundle sizes.
- [x] Obtain a fresh independent review, address material findings, and record final evidence.

## Execution record

Baseline: prior audit passed typecheck, 72 unit tests, 28 integration tests and build. Browser executable missing; browsers are being downloaded into /tmp for this run. Two existing lint warnings concern synchronous state updates in effects.

Ruling: Proceed directly from the user's approval of the concrete audit findings. Use a local feature branch, retaining the visible shared workspace and avoiding an unsolicited worktree relocation.


Task 1: complete — four initial browser regressions failed for the audited reasons before implementation. Native account notice now contains focus, returns it on Escape and closes via its visible control. StrictMode queued close events are ignored when the dialog has already reopened.

Task 2: complete — blocked storage, reset, OS theme changes, explicit preference persistence, cross-tab synchronization, skip links and title/focus transitions pass in Chromium, Firefox and mobile Chromium.

Task 3: complete — full-mode forms are rendered with Vite SSR under VITE_PORTFOLIO_MODE=false exclusively in the test; associated labels, autofill and password button names/states pass. Composition tests cover native isComposing and Safari keyCode 229. Production portfolio restrictions remain enabled.

Task 4: complete with local WebKit verification limitation — responsive hero candidates/high priority and lazy lodging images implemented. Account/chat/review modules are split; guide state is retained after its first opening. CI runs all root checks and four browser projects.

Final review: independent read-only reviewer found a hidden print-only itinerary heading being selected as a focus target. Added an itinerary transition assertion, observed its failure, then selected visible headings and confirmed focus success. The final browser matrix passes this regression on all three locally supported profiles.

Final evidence:
- npm run typecheck: exit 0.
- npm run lint: exit 0, the same two existing react/set-state-in-effect warnings in App and ItineraryPlanner.
- npm test: 49 frontend + 26 backend tests pass (75 total).
- npm run test:integration: 28 tests pass using isolated schemas.
- npm run build: exit 0. Entry bundle 464.61 kB / 139.14 kB gzip, compared with 513.57 kB / 147.85 kB gzip at audit time. The previous >500 kB entry warning is gone. This measures bundle delivery, not field Core Web Vitals.
- Playwright, desktop Chromium + Firefox + mobile Chromium, workers=2, trace on: 21/21 pass after the review correction. Desktop/mobile screenshots inspected; no relevant page errors in the smoke checks.
- One earlier concurrent browser/check run missed the mobile account dialog. The isolated smoke test, eight bounded repetitions and the final isolated 21-test matrix pass. The single failure was not reproduced; no retries were used to hide it. The form SSR test now uses a unique temporary Vite cache and disables HMR, and browser runs are serialized after build output stops changing.
- WebKit downloaded but cannot launch on this host: libicu74 and libjpeg-turbo8 are missing. CI installs engines with --with-deps; no host package installation performed.
- Modern Web Guidance legacy-scan: 0 findings across 38 deterministic guide checks (about 20% of the corpus).
- git diff --check: clean. No runtime dependencies, lockfile, API, migrations or portfolio defaults changed. No commit, push, merge or deployment.

Ruling: Use the built-in showModal API rather than newly available declarative invoker commands, avoiding a new polyfill dependency. Retain the existing CSS palette/classes and synchronize native color-scheme metadata; no wholesale light-dark() palette rewrite is necessary for these defects.
