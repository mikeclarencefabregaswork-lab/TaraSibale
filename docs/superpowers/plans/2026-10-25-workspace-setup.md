# Workspace Setup Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide a runnable React TypeScript frontend, TypeScript backend, and local PostgreSQL database in this workspace.

**Architecture:** npm workspaces with exactly two application folders, `Frontend` and `Backend`. Vite proxies `/api` to Express on port 3001; Express uses a PostgreSQL connection pool. Docker Compose runs only the development database.

**Tech Stack:** React, TypeScript, Vite, Express, node-postgres, Docker Compose, npm.

**Spec:** User requested React TypeScript, separate Frontend and Backend folders, and PostgreSQL; user authorized sensible defaults and immediate execution.

## Global Constraints

- Work directly inside the requested empty workspace; no Git repository exists.
- Do not introduce application-specific tables or features.
- Keep database credentials out of frontend code and ignore local environment files.
- Use local-only database port binding and persistent Docker volume.

## Review Focus

- Database offline: readiness returns 503 without exposing connection secrets.
- API offline: frontend development proxy configuration points to the documented backend port.
- Missing environment: backend fails with an actionable configuration message.
- Production build: backend emits runnable Node ESM and frontend emits static assets.
- Fresh install: root lockfile and scripts cover both applications.

### Task 1: Workspace and frontend

- [x] Scaffold the official Vite React TypeScript template in `Frontend`.
- [x] Add root npm workspace scripts for dev, build, lint, typecheck, test, and database lifecycle.
- [x] Configure frontend `/api` proxy and replace template naming with TaraSibale.
- [x] Verify frontend lint, typecheck, and build.

### Task 2: Backend and PostgreSQL

- [x] Add Backend manifest, strict TypeScript configuration, and environment example.
- [x] Write and run failing HTTP tests: liveness succeeds, connected readiness succeeds, disconnected readiness returns 503 without leaking secrets, unknown route returns 404.
- [x] Implement `createApp(checkDatabase: () => Promise<void>)`, pool connection, and graceful server shutdown.
- [x] Add PostgreSQL Compose service with health check and named data volume.
- [x] Run backend tests, typecheck, build, and HTTP smoke checks.

### Task 3: Handoff

- [x] Document installation, environment configuration, startup, API endpoints, build output, and database lifecycle.
- [x] Run root verification commands and Compose configuration validation.
- [x] Review the integrated files and record any environment limitations.

## Execution record

- Ruling: execute directly in this workspace because it is empty, is not a Git repository, and the user explicitly requested work here.
- Ruling: keep the standard Vite starter UI; this request is infrastructure setup, not a product design task.
- Docker engine inaccessible from sandbox at preflight; approved host execution reached Docker Desktop successfully.
- Task 1: complete — root typecheck, lint, and build exited 0.
- Task 2: complete — four HTTP tests failed before route implementation, then passed 4/4. Loopback tests require host execution in this sandbox.
- Task 3: complete — Compose config valid; combined dev command served frontend and proxied API with HTTP 200. Offline database returned 503. Built backend rejected missing DATABASE_URL with actionable guidance.
- Final live verification: `npm run db:up` exited 0; PostgreSQL healthy on local port 5432 with persistent volume. Built backend returned HTTP 200 and `database: connected` from `/api/health/db`.
- Final independent review: no critical or important findings. Corrected a minor README claim about Vite preview proxy inheritance. No deferred findings.
- Development servers used for smoke checks were stopped; PostgreSQL remains running. No Git initialization, commits, or external publishing performed.
- Final dependency inspection found the original `frontend` workspace link persisted after package renaming. Root `npm install` refreshed the workspace link; verification repeated after the refresh.

## Follow-up: native PostgreSQL

- User requested PostgreSQL without Docker. Removed Compose configuration, Docker lifecycle scripts, and the root Docker environment example. Backend still uses DATABASE_URL; README now covers native Windows PostgreSQL and pgAdmin database creation.
- Follow-up typecheck and lint passed. Final shell exit 1 was from rg finding no lowercase Docker command references, not from a failed check.
- No native PostgreSQL service or installation directory was found. Awaiting user's installation/existing-server preference before provisioning a native database.
- Existing Docker volume was not deleted. Docker API returned HTTP 500 during the read-only table check, so container/data status could not be verified in this follow-up.
