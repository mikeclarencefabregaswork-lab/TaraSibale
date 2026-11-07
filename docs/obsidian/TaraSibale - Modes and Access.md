---
tags: [tarasibale/guide]
reviewed: 2026-11-07
---

# Modes and Access

The project defaults to a portfolio demonstration. Two flags control different
layers: `VITE_PORTFOLIO_MODE` controls frontend behavior, and `PORTFOLIO_MODE`
controls the server's boundary. Both treat any value other than the exact
string `false` as enabled.

## What works by default

Visitors can browse the catalog and cultural material, try sample planning
tools, and interact with a schematic map. Guest saved state stays on their
device. Unknown-rights catalog images are replaced in the outgoing presentation;
stored provenance is preserved.

At the API boundary, portfolio mode allows the public catalog, returns null
for identity and an empty review list, and blocks other application routes
with 403. Health endpoints are registered before this boundary and remain
available. Existing session cookies do not unlock private data in this mode.

## Full application mode is a separate development choice

For intentional local full-mode development, the README describes setting both
flags to `false` and restarting the app. Changing only the frontend flag cannot
remove server restrictions. Changing only the backend flag can leave the UI in
its demo behavior. No flags have been changed by creating these notes.

Full mode enables the underlying account workflows, subject to authorization,
feature settings, validation, and record-specific restrictions. Reference-only
lodgings still cannot be booked. There are no seeded demo accounts or default
administrator credentials.

## Permissions after authentication

The API resolves roles from `users`. Admin routes require both a session and
the `admin` role. Feature switches in `settings` can disable writes, and
maintenance mode blocks feature-gated actions. Signup allows ordinary account
roles but cannot create an administrator. The promotion script targets an
existing account; it is not an automatic login.

## Demonstration limits to keep in mind

- No live weather provider, payment gateway, or external reservation fulfillment
  is connected.
- Guide chat uses local demonstration responses or curated server replies.
- Sample map geometry and reference schedules are not navigation or live sailing
  information.
- Disabling portfolio flags does not complete the project's launch checklist.

The existing release checklist records the content, rights, operational, and
deployment work that would precede a real launch. These notes explain current
behavior; they do not certify that checklist as complete.

Continue: [[TaraSibale - Development]], [[TaraSibale - Feature Flows]].

Sources: [frontend flag](../../Frontend/src/portfolio.ts),
[server boundary](../../Backend/src/app.ts), [catalog transformation](../../Backend/src/portfolio.ts),
[authorization](../../Backend/src/api.ts), [portfolio checks](../../Backend/test/portfolio.test.ts),
[existing launch checklist](../portfolio-release-checklist.md).
