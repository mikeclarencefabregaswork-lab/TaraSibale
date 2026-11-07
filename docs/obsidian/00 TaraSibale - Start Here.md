---
tags: [tarasibale/guide]
reviewed: 2026-11-07
---

# TaraSibale — Start Here

TaraSibale is a tourism portfolio prototype for Concepcion on Sibale Island,
Romblon. It demonstrates destination browsing, cultural information, trip
planning, maps, and the structure of a community travel application.

The working system has three parts: a React interface, an Express API, and a
PostgreSQL database. The default portfolio mode deliberately limits accounts,
bookings, uploads, and publishing. A disabled booking button is therefore not
evidence that the database setup failed.

## Read in this order

1. [[TaraSibale - Architecture]] — how browser, API, and database fit together.
2. [[TaraSibale - Attractions and Data]] — where visible content actually comes from.
3. [[TaraSibale - Database]] — what the tables store and how they relate.
4. [[TaraSibale - Feature Flows]] — follow a user action through the system.
5. [[TaraSibale - Modes and Access]] — which capabilities are active and why.
6. [[TaraSibale - Development]] — run, verify, and troubleshoot the workspace.

For a visual reading route, open [[00 TaraSibale - Reading Map.canvas]].

## Start with a question

| Your question | Read this |
| --- | --- |
| Where does attraction content come from? | [[TaraSibale - Attractions and Data]] |
| Where do I change what the page displays? | [[TaraSibale - Code Map]] |
| Does a guest's itinerary go into PostgreSQL? | [[TaraSibale - Saved State]] |
| Why does signup return 403? | [[TaraSibale - Modes and Access]] |
| How current is this documentation? | [[TaraSibale - Using the Knowledge Base]] |

## Detailed references

- [[TaraSibale - UI Components]] — components, their props, feedback, and local helpers.
- [[TaraSibale - API and Validation]] — server request helpers and accepted payloads.
- [[TaraSibale - Domain Types]] — shared interface fields and data contracts.
- [[TaraSibale - Dependencies]] — each package once, with workspace version ranges.
- [[TaraSibale - Workspace Configuration]] — combined commands, compiler options, and tooling.

There is one canonical note for each responsibility. Symbols such as
`ATTRACTIONS`, `createApp()`, and `pool` are entries inside their owning guide
or reference, rather than separate files. The raw symbol graph remains in
`graphify-out/graph.json` outside Obsidian; automatic communities are not separate
reading material.

The guides describe reviewed source behavior, not live travel conditions or
a production readiness assessment. Source links open the current local checkout;
implementation tables preserve indexed declarations and their explanations.

Source: [project overview](../../README.md), [application shell](../../Frontend/src/App.tsx),
[server boundary](../../Backend/src/app.ts).
