---
tags: [tarasibale/guide]
reviewed: 2026-11-07
---

# Feature Flows

Use a feature flow to answer “what happens after I click this?” Each route below
is prefixed with `/api`. Account and write flows describe full application mode;
the default portfolio boundary blocks those requests earlier.

## Browse a destination

`App.refreshCatalog` → `GET /catalog` → `resources` and review aggregates →
React collections → `AttractionsSection` filtering → detail dialog.

Opening a card does not create a database record. Search/category filters and
the attraction favorite toggle are local UI interactions. See
[[TaraSibale - Attractions and Data]] for the distinction from reference arrays.

## Sign up and sign in

Signup is validated, then a salted scrypt password hash is generated. A
transaction creates `users` and `user_state`. A non-traveler signup also creates
a pending verification application. Signup cannot assign the admin role.

The server issues a random session token as an HttpOnly, SameSite=Lax cookie,
storing only its hash in `sessions`. Subsequent requests join that session to
the current user record, so authorization uses the database role rather than
a client-provided role. Logout deletes the session and clears the cookie.

`/auth/me` restores identity; `/bootstrap` loads private account state. See
[[TaraSibale - Saved State]] for why they are separate from catalog loading.

## Submit a booking

```mermaid
sequenceDiagram
  participant UI as Booking interface
  participant API as Express API
  participant DB as PostgreSQL
  UI->>API: POST /api/bookings
  API->>API: Require session, feature permission, valid input
  API->>DB: Begin transaction and lock accommodation row
  API->>API: Check reference-only mode, room type, guests, availability
  API->>DB: Calculate highest occupied room count across requested nights
  API->>API: Reject if full; calculate total from stored price
  API->>DB: Insert account-owned booking and commit
  API-->>UI: Stored booking with server total and status
```

Checkout day is excluded from nightly occupancy. This allows adjacent bookings
without counting them as overlapping stays. The row lock serializes competing
requests for the same accommodation. A stored `CONFIRMED` status is a local
application record; no payment gateway or external property reservation is called.

The current sourced lodgings are reference-only and are rejected by the booking
handler even in full mode. Integration tests use a synthetic bookable stay to
exercise capacity, price calculation, and concurrency.

## Reviews, messages, and community posts

| Action | Server behavior |
| --- | --- |
| Submit review | Requires session and enabled feature, validates target/rating, derives author from session |
| Vote helpful | Stores one vote per user/review pair |
| Send group message | Requires allowed feature and group membership; derives sender from session |
| Publish social post | Requires session and feature; publishing limits apply |
| Like a post | Uses stored account identity and the unique post/user pair |
| Edit admin permissions/catalog | Requires an authenticated administrator and validated payload |

The UI cannot grant these permissions by changing its local state. Group messages
are fetched through HTTP; `App.tsx` also refreshes them on pull-to-refresh.
This code does not establish a live WebSocket messaging service.

## Guide chat and weather

In portfolio mode, the guide replies in page memory without sending prompts to
the backend. In full mode, `/chat` chooses a curated reply using message keywords;
it does not call an LLM. The implemented `/weather` endpoint returns 503 because
no live provider is configured; portfolio mode blocks that route earlier.

Continue: [[TaraSibale - Modes and Access]], [[TaraSibale - Code Map]].

Symbol references: [[hashPassword()]], [[createApi()]].

Sources: [API and transactions](../../Backend/src/api.ts),
[password hashing](../../Backend/src/auth.ts), [request validation](../../Backend/src/validation.ts),
[chat interface](../../Frontend/src/components/LiveChatBot.tsx),
[full API integration checks](../../Backend/test/api.integration.ts).
