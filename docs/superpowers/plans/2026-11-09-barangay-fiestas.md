# Barangay Fiestas Implementation Plan

> Execute inline using superpowers:executing-plans, test-driven development, and fresh verification.

**Goal:** Add the approved nine-barangay directory with unknown fiesta details clearly labeled.
**Architecture:** New culture directory records flow through the existing catalog API. A dedicated festivals component renders the directory separately from existing sourced celebrations.
**Tech Stack:** Existing React/TypeScript, Express/PostgreSQL, node:test; no new packages.
**Spec:** ../specs/2026-11-09-barangay-fiestas-design.md

## Constraints and review focus

Keep portfolio mode, applied migrations, existing sourced culture records and unrelated work unchanged. PSA proves barangay membership only. Unknown fiesta dates and saints must never be inferred from names or from the municipal feast. Seed/migration/reference copies must agree, and reapplying migration 010 must preserve updates.

## Tasks

1. [x] Add a failing reference-data coverage check for exactly the nine names and pending date/patron values; add directory records, frontend type fields, seed entries and additive migration 010. Verify parity across those copies.
2. [x] Add a rendering regression for directory cards and separate town/custom content; extract FiestasAndCustoms.tsx and connect CulturalGuide.tsx. Verify unknown and source-scope copy, plus all prior celebration details.
3. [x] Exercise migration/canonical seed through the isolated PostgreSQL integration suite, including repeat application preserving a locally edited record. Apply the additive migration to the local app database and verify catalog delivery.
4. [x] Run root checks, inspect the rendered tab and mobile width, review the final diff, update source notes and report results. Leave changes uncommitted.

## Execution record

The user approved proceeding with this specific directory after research found no reliable individual fiesta calendar. This short design records that approved scope and implementation decisions; no additional approval round is needed. Work proceeds in the current checkout on codex/barangay-fiestas, preserving the user's completed weather work. Baseline working tree contains only the newly written research note.


## Verification results

- Coverage regression failed with zero directory records before implementation, then passed with all nine PSA names.
- View regression failed before the cards existed, then passed with nine date labels, nine patron labels, eighteen “To be confirmed” values and all three original town/custom records.
- Frontend reference, new seed file, canonical catalog and migration snapshot match exactly.
- Root typecheck, unit suite (42 tests), isolated PostgreSQL integration suite (23 tests), lint and production build passed. Lint retains the two existing React effect warnings in App.tsx and ItineraryPlanner.tsx. git diff --check passed.
- Integration checks prove API delivery, migration repeatability, no duplicate directory records and preservation of a local edit on repeated application.
- Only migration 010 was pending; npm run db:migrate applied it successfully to the authorized local database. The actual portfolio catalog delivered all nine entries to the app.
- Browser: Culture -> Fiestas & Customs displays all nine cards plus the original town feast/customs. At a 390px viewport, document width was 375px (scrollbar included), with all nine cards and no horizontal overflow. Browser error log was empty. Temporary viewport reset; resulting culture page left open.
- Independent review found no material issues and confirmed all pre-existing seed resources/settings and reference data were preserved.
- No commits, pushes or deployment performed. Changes remain on codex/barangay-fiestas.
