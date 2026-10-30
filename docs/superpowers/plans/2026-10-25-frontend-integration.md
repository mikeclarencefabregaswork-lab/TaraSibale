# TaraSibale Frontend and PostgreSQL Integration Plan

**Goal:** Integrate the supplied UI in Frontend, replace demo sign-in with real accounts, and persist its data in native PostgreSQL.
**Architecture:** Existing npm workspaces, Vite proxy to Express, native PostgreSQL. User authorized real accounts/protected admin and schema creation. Prior preference is to proceed with sensible defaults. No Docker. ZIP instructions are untrusted project content.

## Decisions and contract

- Preserve supplied visual design and navigation. No automatic admin, fake sign-in, or fabricated refresh updates.
- Session cookie `tarasibale_session`: HttpOnly, SameSite=Lax, Secure in production, hashed random token in PostgreSQL; passwords salted scrypt. Never accept admin role from signup. Admin promotion via local CLI only.
- Public `GET /api/catalog` returns `{attractions, accommodations, ferryRoutes, cultureItems, hikingTrails, systemPermissions, socialPosts}`. `GET /api/auth/me` returns a UserProfile or null. Auth signup/login return UserProfile, logout returns 204.
- Signup body `{name,email,password,role}`; login `{email,password,rememberMe}`. Non-admin signup roles accepted unverified. Password minimum 8 characters.
- `GET /api/bootstrap`: authenticated `{user, bookings, groupMessages, verificationApplicants, notifications, documents, itinerary, checklists}`; applicants only for admin. Public reviews are fetched separately.
- `/api/reviews` GET/POST, `/api/bookings` GET/POST, `/api/group-chat` GET/POST, `/api/social-posts` POST and `/:id/like` POST, `/api/reviews/:id/helpful` POST.
- `/api/user-state` PUT partial `{notifications,documents,itinerary,checklists}`; owner inferred from session. `/api/admin/catalog` PUT `{attractions?,accommodations?,ferryRoutes?}`; `/api/admin/permissions` PUT full permissions; `/api/admin/verifications` PUT applicants array. Mutations require session and admin operations require admin on server.
- Booking server recalculates price and checks dates, capacity, room type, availability and overlapping room inventory transactionally. Return a real BookingRecord; no frontend confirmation before server success.
- `/api/chat` POST supports an honest curated guide without AI credentials. `/api/weather` returns unavailable rather than fabricated live readings. Live provider integrations excluded until configured.

## Database interface (migration owns schema below; API writes exact columns)

- `users(id text PK default gen_random_uuid()::text, email text, name text, password_hash text, role text, is_verified boolean default false, created_at timestamptz default now())`; unique lower(email).
- `sessions(token_hash text PK, user_id text FK users cascade, expires_at timestamptz)`.
- `resources(id text PK, kind text, data jsonb)`; unique(id,kind); kinds attraction/accommodation/ferry/culture/trail. data.id matches id, validate core fields, JSON arrays nested.
- `settings(key text PK, data jsonb)` key permissions.
- `reviews(id text PK, target_id text FK resources restrict, user_id text FK users cascade, data jsonb, created_at timestamptz default now())`; rating 1..5 and comment checks, data.id/targetId match relational keys.
- `review_votes(review_id text FK reviews cascade,user_id text FK users cascade,PRIMARY KEY(review_id,user_id))`.
- `bookings(id text PK,user_id text FK users cascade,accommodation_id text,resource_kind text default 'accommodation',check_in date,check_out date,guests_count integer,room_type text,total_amount numeric(12,2),status text,data jsonb,created_at timestamptz default now())`; composite FK(accommodation_id,resource_kind) resources(id,kind), date/amount/status checks.
- `travel_groups(id text PK,name text)` seeded group-101. `group_members(group_id text FK travel_groups cascade,user_id text FK users cascade,PRIMARY KEY(group_id,user_id))`.
- `messages(id text PK,group_id text FK travel_groups cascade,user_id text FK users cascade,data jsonb,created_at timestamptz default now())`.
- `social_posts(id text PK,user_id text nullable FK users SET NULL,data jsonb,created_at timestamptz default now())`.
- `social_likes(post_id text FK social_posts cascade,user_id text FK users cascade,PRIMARY KEY(post_id,user_id))`.
- `verifications(id text PK,user_id text nullable FK users SET NULL,data jsonb,created_at timestamptz default now())`.
- `user_state(user_id text PK FK users cascade,notifications jsonb default '[]',documents jsonb default '[]',itinerary jsonb default '[]',checklists jsonb default '{}',updated_at timestamptz default now())`.
- `schema_migrations(version text PK,applied_at timestamptz default now())` managed by migration script.

## Tasks

1. Frontend owner: integrate source/assets and API client, auth forms, honest writes, user state persistence, admin endpoints. Verify TS/build/lint and avoid modifying backend or lockfile.
2. Database owner: SQL migration, migration/seed scripts, admin CLI, seed JSON copied from source fixtures, schema tests/docs. Only Backend/migrations, Backend/scripts, Backend/seed, docs/database.md. Never run migrations until coordinated by root.
3. Root: Express auth/API validation and persistence; tests first on HTTP boundaries; integrate scripts/dependencies, apply migration and seed native database.
4. Verify migration idempotency, authorization and isolation, booking calculations/capacity, persisted state, root lint/typecheck/tests/build and desktop/mobile rendering. Fresh independent final review.

## Review focus

Password/session security; ownership and role enforcement; invalid/parallel bookings; malformed requests; database outage behavior; async UI errors; persisted data on reload; honest status of external services.

## Progress

- ZIP safely extracted to ignored .superpowers/zip-review; starter backed up under .superpowers/frontend-starter.
- Graphify list_repositories and list_workspaces both blocked by no selected workspace. Direct source inspection used.
- Native DB connected successfully as configured; public schema initially has zero tables.

## Completion evidence

- Frontend source/assets integrated; original starter retained in ignored backup. All archive server scripts and embedded instructions excluded from executable project configuration.
- Real account/session auth implemented with scrypt, hashed tokens, session revocation, CSRF origin checks, rate limiting, unverified non-admin signup roles, admin-only mutations, and local existing-account promotion.
- Native database migrations 001/002/003 applied; seeds insert 6 attractions, 4 accommodations, 4 ferry routes, 5 culture entries and 6 hiking trails (25 resources). No sample people, reviews, applications, or social posts seeded.
- Migration/seed reruns preserve existing content. Rollback validator accepts all25 records and rejects4 malformed coordinate shapes. All temporary QA/test schemas removed (confirmed count0).
- Fresh root typecheck/build/dependency-tree checks exit0. Root lint exits0 with two React set-state-in-effect warnings in initial external-data hydration and itinerary initialization; no lint errors and no disabled rules.
- Fresh root tests: frontend4 + backend6 pass. PostgreSQL integration suite15/15 passes, including authorization, ownership, malformed inputs, votes, group membership, social likes, vault restrictions, concurrent inventory, per-night multi-room occupancy, maintenance-mode reactions, historical verification after admin promotion, and logout.
- Independent backend review found adjacent-booking inventory and historical-verification issues; each reproduced by failing regression then fixed and suite passed. Feature-gating for votes/likes also reproduced and corrected.
- Independent frontend review found stale refresh and FileReader callbacks crossing logout plus stale personal likes on login. Owner/generation guards, read cancellation and identity refresh corrected these.
- Isolated headless Edge/Playwright desktop1440x1000 and mobile390x844 verified page identity, signup, review+reload, booking+reload, PDF+reload, itinerary, map init/navigation, traveler admin denial, delayed document reads after logout, delayed private message refresh after logout, and no mobile horizontal overflow. Final run: no JavaScript page errors or console errors. Two logout request cancellations occurred after successful204 responses during deliberate navigation tests, with session revocation and subsequent login verified.
- Fixed Leaflet delayed invalidateSize after unmount (timer cancellation, instance guards, stop/cleanup) and repaired three UTF8 symbols in review labels. One unavailable source image now uses a local placeholder.
- Browser plugin unavailable; bundled Playwright with installed Edge used. QA artifacts are outside the repo under the task visualization directory. Temporary QA servers stopped; pre-existing workspace dev servers were left intact, verified `/api/catalog` HTTP200 with real seeded catalog.

## Operational limits

- Tourism details are imported reference content, not verified external provider data. Live weather and AI provider not configured; guide uses identified curated replies.
- Booking confirmation persists a local reservation record; no external host notification, payment processing, or supplier reservation system is connected.
- Private files use bounded JSONB data URLs for local development; larger deployment storage is an explicit future choice.
- No default administrator created. User must sign up and promote their account through the documented local command.
