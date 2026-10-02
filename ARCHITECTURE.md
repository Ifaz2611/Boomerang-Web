# Boomerang Architecture (Firebase edition)

## Diagram

```
Browser (React SPA, responsive)
   │  Firebase SDK (no Next.js API routes)
   ▼
┌──────────────────────────────┐      ┌───────────────────────────┐
│  Next.js 16 (static pages)   │      │  Firebase                 │
│  / browse+filters ──────────►│      │  Auth (email/password)    │
│  /items/new ──► createItem ──►│─────►│  Firestore                │
│  /items/[id] ─► getItemDetail │      │   users/{uid}             │
│    claim form ─► submitClaim ─►│      │   items/{id}              │
│    verify UI ──► decideClaim ─►│      │   items/{id}/claims/{cid} │
│  /dashboard ──► fetchItems    │      │   keywords/{id}           │
│  /admin ──────► fetch+status  │      │   notifications/{id}      │
│  /keywords ───► keywords+notif│      │  Storage (item photos)    │
└──────────────────────────────┘      └───────────────────────────┘
   Demo mode (no .env.local): lib/data.ts falls back to
   localStorage seeded from lib/demo-data.ts — same shapes.
```

## Data model (Firestore)

`users/{uid}`: `{ name, email, role: "user"|"admin", createdAt }`
`items/{id}`: `{ type, title, description, category, location, eventDate, tags[],
imageUrl, status, ownerId, ownerName, createdAt, updatedAt }`
`items/{id}/claims/{claimId}`: `{ claimantId, claimantName, proof, contactNote,
status, createdAt }`
`keywords/{id}`: `{ userId, keyword, createdAt }`
`notifications/{id}`: `{ userId, itemId, keyword, message, read, createdAt }`

Suggested indexes: `items(status, createdAt desc)`, `items(ownerId, createdAt desc)`,
`notifications(userId, createdAt desc)`, `keywords(userId)`.

## Request flows (all client → Firestore, gated by Security Rules)

**Post:** `createItem()` → new doc `status: pending` (or `published` if admin) →
client fan-out writes `notifications/*` for matching keywords (move to a Cloud
Function on `items` create when you outgrow client fan-out).

**Search:** `fetchItems(filters)` → Firestore `where(status in [published, claimed,
resolved])` for anonymous browsing (+ `where(ownerId==…)` for dashboards) →
client-side keyword/tag/date refinement.

**Claim:** `submitClaim()` → add `claims/*` (`pending`) + set item → `claimed`.

**Verify:** `decideClaim()` → accept: mark claim `accepted`, reject competing
`pending` claims; reject: claim → `rejected` (item stays `claimed` until resolved).

**Moderate:** `setItemStatus()` — staff only per rules (`pending→published→claimed→
resolved`, `rejected` branches). Regular users may only set their own item → `resolved`.

## Security rules (sketch — enforce in Firebase Console)

```js
match /items/{id} {
  allow read: if resource.data.status in ["published","claimed","resolved"]
    || request.auth.uid == resource.data.ownerId || isAdmin();
  allow create: if request.auth != null;
  allow update: if isAdmin()
    || (request.auth.uid == resource.data.ownerId
        && request.resource.data.status == "resolved");
}
match /items/{itemId}/claims/{claimId} {
  allow read: if isAdmin() || isItemOwner(itemId) || request.auth.uid == resource.data.claimantId;
  allow create: if request.auth != null;
  allow update: if isAdmin() || isItemOwner(itemId);
}
```

`isAdmin()` reads `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"`.
Promote the first staff member manually in the Console (or via a Cloud Function).

## Demo mode

Without `NEXT_PUBLIC_FIREBASE_*` env vars, `lib/data.ts` + `lib/auth-context.tsx`
use `localStorage` seeded from `lib/demo-data.ts`. Demo logins:
`admin@campus.edu / Admin123!` (staff), `maya@campus.edu` / `sam@campus.edu` /
`Password123!`. Add real keys to `.env.local` and reload to go live — no code changes.
