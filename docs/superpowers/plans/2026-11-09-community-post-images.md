# Community Post Images Implementation Plan

> Execute inline using superpowers:executing-plans and test-driven development.

**Goal:** Optional device photo attachment with preview and persistent posts, respecting portfolio restrictions.
**Architecture:** A focused composer owns the draft and async selection lifecycle. A browser helper resizes/re-encodes images; the existing authenticated post API validates bounded raster data URLs and stores them in its existing JSONB record. Existing HTTP images remain valid.
**Tech stack:** Existing React/TypeScript, browser canvas/ImageBitmap, Express/Zod/PostgreSQL. No packages or migration required.
**Spec:** ../specs/2026-11-09-community-post-images-design.md (approved by user).

## Constraints and review focus

Preserve default portfolio publishing/authentication restrictions and unrelated Header work. Accept one JPEG/PNG/WebP source of at most 5 MiB; re-encode at max 1600px longest edge and 1 MiB final decoded bytes. Never attach stock photos automatically. Test malformed base64/MIME mismatches, missing images, selection races, draft failure retention, reset/discard and persistence. Do not enable a public service or add storage credentials.

## Tasks

1. [x] Demonstrate failures for valid raster attachments and caption-only posts. Add bounded backend post-image validation and optional image field. Verify existing URL compatibility and invalid/oversized rejection.
2. [x] Add browser image helper, file validation and aspect-ratio resize tests. Extract the composer with choose/preview/replace/remove, accessible labels, processing state and stale-selection protection. Update the feed to omit empty image areas and accept draft payloads.
3. [x] Extend isolated API integration checks to save/reload an attachment and a caption-only post, reject invalid attachments, and prove portfolio rejection. Run root checks and verify browser file selection, errors, replace/remove, cancellation, and responsive rendering where supported.
4. [x] Independent scoped review, final diff inspection, documentation and evidence record. Leave changes uncommitted.

## Execution record

User approved the concrete design. Work stays in the current checkout on codex/community-post-images, preserving the pre-existing Header modification. No worktree/commit/merge/deployment required.


## Verification results

- Before implementation, uploaded PNG/JPEG acceptance failed and the feed rendered two images (including a broken post image) for a caption-only post. Those regressions now pass. Malformed URL rejection also exposed and fixed an uncaught URL-constructor exception in the shared URL refinement.
- Final root checks: npm test passed 56 tests (30 frontend, 26 backend); npm run test:integration passed 24 tests; typecheck and production build passed; lint passed with only the two pre-existing React effect warnings in App.tsx and ItineraryPlanner.tsx; git diff --check passed.
- Isolated database checks verified authenticated image save/reload, server-controlled authorship, caption-only save/reload and rejection of malformed attachments. Default portfolio restrictions remained enabled throughout the actual app.
- Browser verified choose/preview/replace/remove, caption/photo retention after portfolio rejection, discard/reopen reset, empty-draft reset, and inline feedback for >5 MiB, SVG and corrupt PNG input. A real 4000x2000 PNG was converted to a 1600x800 WebP of approximately 3 KiB; that exact browser output passed the backend validator. A JPEG from the existing project assets also decoded/re-encoded and previewed correctly.
- At 390px the dialog was 343px wide, its image was 299px wide, and document width was 375px; no horizontal overflow. Viewport restored and test drafts discarded. One immediate Cancel click after viewport restoration did not register; after observing the settled UI, Close and a fresh select/Cancel cycle both worked. No JavaScript errors appeared.
- A version token guards obsolete processing results after replacement/removal/cancel/unmount; source review verified the guards. Automated scheduling of those races was not performed. Browser transitions exercised normal replacement and cancellation.
- Independent reviewer found no important actionable issues. Its independent root test attempt hit sandbox socket restrictions; the coordinator's approved full-suite execution passed.
- Existing Header work left untouched. No packages, schema changes, real posts, credentials, commits, push or deployment were added. Screenshot: /tmp/tarasibale-community-image-preview.png.
