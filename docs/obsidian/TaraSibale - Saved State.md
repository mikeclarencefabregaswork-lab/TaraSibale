---
tags: [tarasibale/guide]
reviewed: 2026-11-07
---

# Saved State

Trip notes and private documents do not all use the same storage path. The
important distinction is whether there is a signed-in account.

| State | Storage | Consequence |
| --- | --- | --- |
| Guest notifications, itinerary, documents, checklists | Browser `localStorage` through the saved-state hook | Device/browser-local; not account sync |
| Signed-in saved state in full mode | PostgreSQL `user_state` via authenticated API | Loaded and saved for the session's account |
| Attraction favorites | `AttractionsSection` React state | Current visit; not part of account persistence |
| Active tab and theme | Separate localStorage preferences | Restored in that browser |
| Portfolio guide conversation | Page memory | Not sent to the server in portfolio mode |

## How autosave works

`useUserStatePersistence` tracks notifications, documents, itinerary, and
checklists. It waits 650 ms after changes before flushing changed collections.
For a guest it writes a browser storage entry. Portfolio and normal guest mode
use different storage keys.

For an account it queues writes to `PUT /api/user-state`. The request includes
`X-TaraSibale-User-Id`, binding the intended account to the save. The server
compares that value with the authenticated session and rejects mismatches with
409, protecting against a stale tab saving one account's data under another.

The server chooses the owner from the session, validates permitted fields, and
updates them transactionally. The header is a stale-account check, not a way
to choose another user's records.

## Loading and failure behavior

`/bootstrap` loads account state after identity is known. The frontend uses
account/generation checks to avoid accepting stale responses after identity
changes. Successful saves advance the baseline; rejected writes show an error
instead of claiming sync succeeded.

On page exit, the hook attempts a final local save or a bounded keepalive HTTP
request. Larger payloads rely on normal autosave. This is not a guarantee that
every unfinished request survives closing the browser or losing connectivity.

## Document limits

The server accepts validated PDF and PNG/JPEG/WebP data URLs, with 1 MiB per
decoded file, at most 20 documents, and a 4 MiB limit on the total encoded
content. This implementation stores document content in account-owned JSONB.
It is not an external cloud-drive integration.

Continue: [[TaraSibale - Database]], [[TaraSibale - Modes and Access]].

Symbol reference: [[useUserStatePersistence()]].

Sources: [saved-state hooks](../../Frontend/src/userState.tsx),
[request helper](../../Frontend/src/api.ts), [account loading](../../Frontend/src/App.tsx),
[owner validation](../../Backend/src/api.ts), [payload limits](../../Backend/src/validation.ts).
