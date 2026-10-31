# Portfolio Readiness Implementation Plan

**Goal:** Make the existing app suitable for demonstrating with sample data while preserving its implementation and database.
**Architecture:** Default-on frontend/backend portfolio mode, early read-only API boundary, sanitized public content and visible collection/safety notices.
**Tech Stack:** React, TypeScript, Express, PostgreSQL, existing node:test tooling.
**Spec:** docs/superpowers/specs/2026-10-31-portfolio-readiness-design.md

## Global constraints
No migrations, database changes, credential changes, deployment or dependency installation. Preserve licensed food credits and existing application code. Do not claim legal clearance.

## Review focus
Direct API bypass; pre-existing session cookies/private state; nested image references; printed/exported claims; mobile notice wrapping.

## Tasks
- [x] Add request-level tests for portfolio mutations/private reads, anonymous session status and mode opt-out. Use a database stub that throws on any query to prove enforcement precedes database access.
- [x] Add pure content sanitization tests for unknown images/nested galleries, preserved licensed food photos and non-mutation of database objects.
- [x] Implement backend portfolio middleware and catalog sanitization, default on; preserve full app only through explicit local opt-out.
- [x] Add frontend mode, global notice/details, sample account/document panels, isolated guest storage, safe imagery and local map tiles; remove official claims/hotlines; guard navigation exports and guide dispatch.
- [x] Archive unknown-rights public assets outside public; add original SVG monogram/map/placeholder assets, licenses register and acquisition checklist; preserve third-party runtime notices in build.
- [x] Run focused tests, all unit tests, lint, typecheck and build; inspect desktop/mobile rendered flows and API behavior; review final diff and record limitations.
