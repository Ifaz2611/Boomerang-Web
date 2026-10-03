# Boomerang — Team TODO

> This is a **group project**. The app is intentionally **partially unfinished**.
> Each member implements their assigned task on their **own branch** and merges via **pull request**.
> Branch + PR workflow is documented in [README.md](./README.md).

## Members

| # | Name | Role | Branch | Task |
|---|------|------|--------|------|
| 1 | **Ifaz Md Zahin** | Leader | `main` (integrator) | Task 1 — DONE: auth, report item, browse board, setup. Reviews & merges all PRs. |
| 2 | **Kazi Abtahi** | Member | `feat/search-filters-kazi` | Task 2 — Search, filters & sorting on the registry |
| 3 | **Tausiful Islam** | Member | `feat/claims-tausiful` | Task 3 — Claim submission, verification & mark-as-returned |
| 4 | **Mirza Rafi** | Member | `feat/alerts-admin-mirza` | Tasks 4 + 5 — Keyword alerts/notifications & admin moderation |

Rule: **only work in your own task files**. If you need something from another task, open an issue — don't edit their files.

---

## Task 1 — DONE (Ifaz Md Zahin, Leader)

Status: complete. Do not roll back.

- Project setup (Next.js + Firebase config, demo-mode fallback).
- Auth (login / register, demo sessions, `lib/auth-context.tsx`).
- Report item (`app/items/new/page.tsx` + `createItem()` in `lib/data.ts`, photo upload).
- Browse board base (`app/page.tsx` list + `ItemCard`, `fetchItems()`, `getItemDetail()` read paths).
- Dashboard my-posts, layout, Navbar, styling.

Leader also: keeps `main` green, reviews PRs, resolves conflicts, handles Firebase console / deployment.

---

## Task 2 — Search, filters & sorting (Kazi Abtahi)

Branch: `feat/search-filters-kazi`

**Where the TODO lives:** `app/page.tsx` → “Search & filters — TODO · assigned: Kazi Abtahi”.

### To build

1. Filter bar above the notice board with:
   - text query (title / description / tags — reuse `matchesFilters()` logic in `lib/data.ts`),
   - type toggle (all / lost / found),
   - category select (from `CATEGORIES` in `lib/types.ts`),
   - location substring, date range (`from` / `to`), tags input,
   - sort (newest / oldest) — client-side is fine.
2. Wire state → `fetchItems(filters)` and re-render the board. Show result count, empty state (“No entries match… Clear filters”), loading skeletons, and error state.
3. Keep it working in **both** demo mode and Firestore mode (only use `ItemFilters` fields — don't invent new query shapes that break `fetchItems()`).
4. Mobile-friendly (stack on small screens), accessible labels.

### Files to touch (only these)

- `app/page.tsx` (replace the TODO placeholder section with the real filter bar)
- Optional small helper, e.g. `app/components/FilterBar.tsx` (new file OK)

### Done when

- [ ] Typing “wallet” filters the board; clearing restores everything.
- [ ] Type + category + location + date + tags filters each narrow results.
- [ ] Empty result shows a helpful empty state, not a blank page.
- [ ] `npm run lint` and `npm run build` pass.

---

## Task 3 — Claims + verification + mark-as-returned (Tausiful Islam)

Branch: `feat/claims-tausiful`

**Where the TODOs live:** `app/items/[id]/page.tsx` (claim form, verify list, mark-as-returned) + stubs in `lib/data.ts`.

### To build

1. `lib/data.ts` — implement (replace the `TODO` throws, keep signatures):
   - `submitClaim(itemId, proof, contactNote, claimant)` — validate proof ≥ 10 chars, require login; demo mode: push to `LS_CLAIMS` + set item → `claimed`; Firestore: `addDoc(items/{id}/claims)` + `updateDoc` item status.
   - `decideClaim(itemId, claimId, decision)` — accept: claim → `accepted`, other `pending` claims for the item → `rejected`; reject: claim → `rejected`. Both demo + Firestore paths.
2. `app/items/[id]/page.tsx` — replace the three TODO cards with working UI:
   - Claim form (proof textarea + meetup note, validation messages, login guard, success message + reload).
   - Verify section visible to poster/admin only (`isOwnerOrAdmin` already computed): list claims with status pills, proof/meetup text, Accept/Reject buttons.
   - “Mark as returned” button for owner/admin when status is `published`/`claimed` → `setItemStatus(id, "resolved")` (+ admin “Reject listing” → `"rejected"`).
   - Privacy note stays: contact details hidden until accepted; never ask for full ID numbers.
3. Coordinate with Mirza on `setItemStatus()` (Task 5 owns the canonical implementation — either reuse his PR or implement compatibly and merge together).

### Files to touch (only these)

- `app/items/[id]/page.tsx`
- `lib/data.ts` (`submitClaim`, `decideClaim`, plus `setItemStatus` in coordination)

### Done when

- [ ] Logged-out user sees “please log in”; short proof (< 10 chars) shows a validation error.
- [ ] Valid claim appears in verify list as `pending` and item flips to `claimed`.
- [ ] Owner/admin Accept → `accepted`, others → `rejected`; Reject keeps item `claimed`.
- [ ] “Mark as returned” flips item to `resolved`.
- [ ] `npm run lint` and `npm run build` pass.

---

## Task 4 — Keyword alerts + notifications (Mirza Rafi, part 1)

Branch: `feat/alerts-admin-mirza` (shared with Task 5)

**Where the TODO lives:** `app/keywords/page.tsx` (whole page is a stub) + stubs in `lib/data.ts` + unread badge in `app/components/Navbar.tsx` (already wired — just needs working `listNotifications()`).

### To build

1. `lib/data.ts` — implement:
   - `listKeywords(userId)` / `addKeyword(userId, keyword)` (trim + lowercase, dedupe, min 2 chars) / `removeKeyword(id)` — Firestore `keywords` collection + demo `LS_KEYWORDS`.
   - `fanOutMockNotifications(item)` — create `LS_NOTIFS` entries for keywords matching `title + description + tags` (exclude the owner's own posts, avoid duplicates).
   - `listNotifications(userId)` — Firestore `notifications` (order `createdAt` desc, limit 50) + demo lazy-match scan so demo alerts appear; return `{ notifications, unread }`.
   - `markAllRead(userId)` — set all mine to `read: true` (both modes).
2. `app/keywords/page.tsx` — replace the stub with working UI:
   - save form + suggestion chips (`wallet`, `calculator`, …) that fill the input,
   - “My keywords” pill list with remove buttons,
   - “Matches” list with unread badge, links to `/items/{id}`, timestamps, “Mark all read”.
   - Keep login guard (“Log in to use alerts”).

### Files to touch (only these)

- `app/keywords/page.tsx`
- `lib/data.ts` (keyword + notification functions)
- `app/components/Navbar.tsx` — read-only if needed (badge already calls `listNotifications()`; don't redesign the navbar)

### Done when

- [ ] Saving “wallet” then posting a matching item (as another user) produces a notification.
- [ ] Matches list shows unread count; “Mark all read” clears it; Navbar badge agrees.
- [ ] Duplicate / blank keywords are rejected gracefully.
- [ ] `npm run lint` and `npm run build` pass.

---

## Task 5 — Admin moderation queue (Mirza Rafi, part 2)

Branch: `feat/alerts-admin-mirza` (same branch as Task 4 — or split into `feat/admin-mirza` if preferred; say which in the PR).

**Where the TODO lives:** `app/admin/page.tsx` (queue works, Publish/Reject/Resolve buttons show “soon”) + `setItemStatus()` stub in `lib/data.ts`.

### To build

1. `lib/data.ts` — implement `setItemStatus(itemId, status)`:
   - demo mode: update `LS_ITEMS` entry's `status` + `updatedAt`; Firestore: `updateDoc(items/{id}, { status, updatedAt })`.
   - Allowed flows: `pending → published | rejected`, `published → claimed | rejected`, `claimed → resolved`, any → `resolved` by owner/admin. (Enforcement can be UI-level; rules sketch lives in `ARCHITECTURE.md`.)
2. `app/admin/page.tsx` — wire the `update()` handler (currently shows the TODO notice):
   - Publish / Reject / Resolve buttons call `setItemStatus()` + reload the queue + show confirmation (`Item → published.` etc.), error path on failure.
   - Keep staff-only guard (non-admin sees “Security office only”), tab counts, skeletons, empty “Queue clear” state.
3. E2E check with Task 1 + 3: report as student → `pending` → admin publishes → `published` → claim → `claimed` → resolve → `resolved`.

### Files to touch (only these)

- `app/admin/page.tsx`
- `lib/data.ts` (`setItemStatus`)

### Done when

- [ ] Non-admin visiting `/admin` sees the guard, not the queue.
- [ ] Publish moves an item `pending → published` (visible on home board); Reject hides it; Resolve marks `resolved`.
- [ ] Counts per tab update after each action.
- [ ] `npm run lint` and `npm run build` pass.

---

## General rules (all members)

1. **One branch per person.** Create it from `main`, push it, open a PR into `main`. Never push to `main` directly.
2. **Small PRs.** One task = one PR (Mirza may use one PR for Tasks 4+5 or two — state it in the PR description).
3. **Before opening a PR:** `npm install`, `npm run lint`, `npm run build` — all green. Describe what you built + how to test (see README workflow).
4. **Don't break demo mode.** Everything must work with no Firebase keys (localStorage fallback) — that's how it will be graded.
5. **Don't claim others' files.** Task 3 and Task 5 both touch `setItemStatus()` — coordinate in the PR comments; leader merges Task 5 first, then Task 3 rebases.
