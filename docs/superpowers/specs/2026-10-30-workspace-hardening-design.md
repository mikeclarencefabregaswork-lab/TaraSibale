# Targeted workspace hardening

## Goal and constraints
Preserve the current application, local PostgreSQL data, website account credentials, UI, and existing feature set. Correct demonstrated privacy bugs and add narrowly scoped abuse protections. No deployment, publishing, destructive database changes, password rotation, or architectural rewrite.

## Approaches
1. Targeted, backward-compatible repairs and measured optimization (selected by the user).
2. Broader architecture refactoring (deferred because it increases regression risk without an established need).

## Changes
- Restrict Vite's filesystem serving to frontend resources and explicitly deny database storage and backend files. Preserve its default secret-file exclusions. Verify direct requests cannot retrieve the project database password or log.
- Bind signed-in autosave and page-exit saves to the account that produced the data. Reject a mismatching authenticated account before database writes. Old tabs must receive a useful reload/sign-in error rather than copy private documents into a different account.
- Apply account-based publishing throttles to review, group-message, and social-post creation. Preserve existing feature switches and authentication. Do not impose new review uniqueness or retention policies that would change stored data.
- Align document type and size validation across server/upload/download paths, including supported WebP documents and exact decoded-size enforcement.
- Make only evidence-backed performance/refactoring changes found during testing. Do not remove legitimate synchronization effects just to silence lint warnings.

## Verification
Run focused regression checks before and after changes, including stale-owner rejection and unchanged account isolation. Use a disposable PostgreSQL test schema. Run unit tests, integration tests, typecheck, lint, build, dependency advisory audit, and rendered UI smoke checks where available. Verify startup still works and do not leave additional app servers running.

## Limits
The current PostgreSQL role is the local cluster administrator. Changing role/credential architecture requires a separate explicit decision; document deployment needs without silently altering this local login. Installed dependencies, compiled outputs, and live PostgreSQL storage are excluded from exhaustive first-party source review. Cloud scans do not inspect uncommitted local files and are not a substitute for local verification.
