# Workspace Hardening Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this approved design in the current session.

**Goal:** Fix demonstrated secret exposure and cross-account private writes, bound publishing bursts, and align document handling without changing stored data or credentials.
**Architecture:** Retain React/Vite, Express and PostgreSQL. Tighten filesystem serving, add optional expected-owner validation for backward-compatible autosaves, add account-based publishing middleware, and share each layer's document format contract.
**Tech Stack:** TypeScript, React, Express, PostgreSQL, Vite, node:test.
**Spec:** ../specs/2026-10-30-workspace-hardening-design.md (approved by user).

## Global Constraints
- Preserve UI, existing records, account credentials, and public feature behavior.
- No deployment, destructive database changes, or architecture rewrite.
- Temporary-schema integration tests only; no test accounts in application tables.

## Review Focus
- Stale browser tabs must not transfer documents across account cookies.
- Page-exit saves must carry the same expected-owner guard as normal saves.
- Frontend assets/hoisted packages must work while sibling secrets are inaccessible.
- Publishing throttles must isolate users and preserve feature/authentication guards.
- Exact 1 MiB files and valid WebP remain usable; oversized/invalid base64 is rejected.

## Task 1: Initial security evidence
- [x] Preserve threat model, initial findings and honest scan coverage in the existing Codex Security scan.
- [x] Validate file exposure without printing credentials and account-switch behavior with synthetic data.

## Task 2: Vite filesystem isolation
Files: Frontend/vite.config.ts; Frontend/test/vite-security.test.ts.
- [x] Add a real-server regression test for frontend availability and sibling secret/backend denial.
- [x] Run it and confirm current config exposes a harmless private-directory probe.
- [x] Restrict fs.allow to the frontend and required node_modules; retain default denies and deny .local-postgres/Backend.
- [x] Rerun regression and browser smoke checks.

## Task 3: Account-bound autosave
Files: Backend/src/api.ts; Frontend/src/api.ts; Frontend/src/userState.tsx; Backend/test/api.integration.ts; Frontend/test/api.test.ts.
- [x] Reproduce stale-owner PUT using two test users and assert no data reaches the second user.
- [x] Add optional expectedUserId to api() and pass X-TaraSibale-User-Id on autosave/pagehide; reject a supplied mismatching owner server-side with 409 before writes. Missing header preserves compatibility for existing clients, but updated UI always supplies one.
- [x] Verify normal autosaves, mismatching saves, pagehide request construction, and user isolation.

## Task 4: Publishing limits and document contract
Files: Backend/src/publishing.ts; Backend/src/validation.ts; Backend/src/api.ts; Backend/test/publishing.test.ts; Backend/test/validation.test.ts; Frontend/src/components/CloudVaultCalendar.tsx.
- [x] Add regressions for same-account burst rejection, independent-account allowance, 1 MiB data URLs, invalid base64, and oversized payload rejection.
- [x] Apply per-account 30 writes/minute to review, group-chat and social-post creation only; deny before insertion and JSON parsing for unauthorized routes where feasible.
- [x] Decode-size validation enforces 1 MiB while preserving the existing total encoded limit. Add WebP to upload/download acceptance.
- [x] Verify all focused tests.

## Task 5: Evidence-backed optimization and final checks
- [x] Reduce initial bundle only with conditional imports of tools unused on Explore, retaining existing Suspense behavior.
- [x] Run typecheck, lint, unit tests, PostgreSQL integration tests, build and UI smoke; record before/after bundle sizes.
- [x] Review changes independently, preserve scan report and document known deployment limits without claiming production readiness.

## Execution evidence and decisions
- Executed in the existing workspace: Git metadata is unavailable (the protected `.git` directory is empty), so a linked worktree/branch/commit cannot be created here. Original touched files were preserved under `/tmp/tarasibale-hardening-before` for independent comparison.
- Ruling: keep the expected-owner header optional for backward-compatible clients; the updated UI always sends it on normal and page-exit autosaves. Old open tabs must reload to receive the guard. Cost if wrong: older clients do not get the new owner-binding protection.
- Ruling: retain the two existing React synchronization-effect warnings rather than remove legitimate catalog/itinerary synchronization just to silence lint. Cost if wrong: those existing render costs remain.
- Initial security audit completed against the pre-remediation snapshot: two medium findings and one low finding, with explicitly partial source coverage. Remediation was separately verified; no second scan or remote deployment was performed.
- RED to GREEN: Vite sibling private-file probe; mismatching-owner integration PUT; frontend expected-owner header; malformed/oversized document validation. Publishing limiter tests verify thirty allowed requests, 429 on the next, and independent account budgets.
- Final: frontend unit suite 8/8; backend unit suite 10/10; PostgreSQL integration suite 21/21 (includes parent test). Typecheck and build pass; lint exits zero with two pre-existing React warnings. npm audit reports zero known advisories.
- Main production JavaScript bundle: 478.79 kB before, 406.58 kB after (15.1% smaller; gzip 125.99 -> 110.89 kB).
- Browser: six deferred tool pages render; mobile vault and 1024-pixel More menu checked; no console warnings/errors; live private-file probes now403; API database health200.
- Read-only data check:29 catalog rows,9 migration records, existing administrator preserved.
- Independent final review found no Critical/Important defect.
- Final: minor (deferred): add direct persistence-hook/pagehide event regression coverage; current test checks shared request construction plus real API ownership rejection.
- Final: minor (deferred): make harmless Vite probe cleanup survive server-construction/close exceptions.
