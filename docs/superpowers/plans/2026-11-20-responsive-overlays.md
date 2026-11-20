# Responsive Overlays Implementation Plan

**Goal:** Apply the native dialog and popover recommendation accepted by the user's “proceed”.

**Architecture:** Extend the existing ModalDialog for blocking forms and the mobile navigation sheet. Use a shared controlled Popover for contextual controls, native dismissal and CSS anchor positioning, with centered placement when anchors are unsupported and a small manual fallback for browsers without Popover.

**Constraints:** Preserve the dirty working tree, portfolio restrictions, styling, API and database behavior. No dependencies, commits, deployment, or worktree relocation.

## Tasks

- [x] Add browser regressions for contextual dismissal, viewport bounds, modal mobile navigation, review form focus, and backdrop drag safety; run them to demonstrate the gaps.
- [x] Extend ModalDialog with heading IDs, custom sizing/sheet class and dismissal guard. Migrate booking, review, admin and community forms and mobile More navigation; remove redundant body locks from existing weather/attraction dialogs.
- [x] Add Popover and responsive anchor CSS; migrate appearance, header panels, notifications and the persistent non-modal guide. Preserve guide conversation state and theme radio behavior.
- [x] Run root typecheck, lint, unit, integration and build checks, then available desktop/mobile browser profiles. Review the final changes and record limitations.

## Review Focus

Native closed states must not be overridden by flex/grid styles. StrictMode cleanup close events must not dismiss reopened dialogs. Dismissal during community submission stays guarded. Nested appearance popovers must not dismiss the profile panel. Browser fallback placement must remain usable without anchor positioning. Focus must return when panels are conditionally unmounted.

## Execution

Proceed inline under the user's authorization; the earlier answer supplies the selected approach. Existing unrelated modifications remain intact.

Independent review identified focus loss on conditional dialog removal, nested React toggle propagation, nested fallback Escape dismissal, missing centered placement after Tailwind's margin reset, and guide focus loss. Each issue was reproduced with a browser regression and corrected. Dialogs close in layout cleanup before DOM removal; popovers ignore descendant toggle events; fallback Escape targets the last open panel; contextual panels have explicit centered base placement; the guide retains its launcher and returns focus to its actual invoker, except when an action navigates to a destination. React's client autoFocus does not establish a persistent autofocus attribute for popover reopening, so guide input focus is synchronized after the panel is shown.

Fresh evidence:
- npm run typecheck: exit 0.
- npm run lint: exit 0, only the two pre-existing set-state-in-effect warnings in App and ItineraryPlanner.
- npm test: 49 frontend and 26 backend tests pass.
- npm run test:integration: 28 tests pass in isolated schemas.
- npm run build: exit 0.
- Browser matrix: 55 pass across desktop Chromium, Firefox and mobile Chromium; two desktop skips are the mobile-only navigation sheet test. Includes native/fallback nested panels, missing anchor positioning, all viewport corners, busy forms, backdrop drag safety, explicit close focus, and guide focus/conversation retention.
- WebKit cannot launch: host lacks libicu74 and libjpeg-turbo8. No host package installation attempted.
- Mobile appearance screenshot inspected; git diff --check passes.

Verification used a temporary Playwright configuration at /tmp/tarasibale-overlays.config.ts with API port 3003 and frontend port 5175. The pre-existing API on port 3001 did not publish the expected portfolio flag; it was left untouched. Tests start their own API with PORTFOLIO_MODE=true. No production configuration, dependencies, lockfile, API, migrations, portfolio defaults, commit, push or deployment changed as part of this task.
