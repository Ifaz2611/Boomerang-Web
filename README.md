# Boomerang — Campus Lost & Found (Firebase edition)

> **Group project — everyone must contribute.**
> This repo is intentionally **partially unfinished**. Three features are stubbed with
> `TODO` placeholders in the UI and in `lib/data.ts`. Each member builds their assigned
> part on **their own branch** and merges through a **pull request**. No direct pushes to `main`.
>
> Task breakdown: [`todo.md`](./todo.md).

Report **Lost/Found** posts, **search with filters**, submit **claims with owner proof**,
**verify claims**, **moderate** as security office, and get **keyword alerts** —
with **Firebase Auth + Firestore + Storage** and zero custom backend.

## Team & task split

| # | Name | Role | Branch | Owns |
|---|------|------|--------|------|
| 1 | **Ifaz Md Zahin** | Leader (integrator) | `main` | Auth, report item, browse board, setup — DONE. Reviews & merges all PRs. |
| 2 | **Kazi Abtahi** | Member | `feat/search-filters-kazi` | Search, filters & sorting (`todo.md` Task 2) |
| 3 | **Tausiful Islam** | Member | `feat/claims-tausiful` | Claims + verification + mark-as-returned (`todo.md` Task 3) |
| 4 | **Mirza Rafi** | Member | `feat/alerts-admin-mirza` | Keyword alerts/notifications + admin moderation (`todo.md` Tasks 4 + 5) |

Current state: Task 1 works. Tasks 2–5 show **“TODO · assigned: …”** banners in the app until their PRs land.

## How to contribute (branches + pull requests)

Every member follows this exact workflow. Do your work **only** in your assigned files (see `todo.md`).

```bash
# 1. Get the latest main
git checkout main
git pull origin main

# 2. Create YOUR branch (use your assigned name, once — reuse it for updates)
git checkout -b feat/search-filters-kazi   # Kazi
# git checkout -b feat/claims-tausiful      # Tausiful
# git checkout -b feat/alerts-admin-mirza   # Mirza

# 3. Build your feature, then check it
npm install
npm run lint
npm run build
npm run dev      # http://localhost:3000 — click through your feature in demo mode

# 4. Commit + push your branch
git add <your files only>
git commit -m "feat: <what you built> (Task N)"
git push -u origin <your-branch>

# 5. Open a pull request (GitHub → Compare & pull request)
#    base: main  ←  compare: <your-branch>
#    Title: "Task N: <feature> — <your name>"
#    Body: what changed, files touched, how to test (demo steps), screenshots if UI.
```

PR rules:

1. **One task = one PR** (Mirza may do one PR for Tasks 4+5 or two — state it in the PR).
2. `npm run lint` and `npm run build` must be green. The leader will not merge red PRs.
3. Keep PRs small and in your own files. Need another member's function (e.g. Tasks 3 + 5 share `setItemStatus()`)? Comment on the PR and let the leader order the merges — don't rewrite their files.
4. Leader (Ifaz) reviews, requests changes if needed, merges, and resolves conflicts. After your PR merges, everyone runs `git checkout main && git pull` and rebases their open branch.

## Quick start (2 minutes, no Firebase needed)

```bash
npm install
npm run dev      # http://localhost:3000
```

The app runs in **demo mode** (local data + local auth) until you add Firebase keys.
Everything must keep working in demo mode — that is how it will be graded.

Demo accounts (demo mode):

| Role | Email | Password |
|---|---|---|
| Security office (staff) | `admin@campus.edu` | `Admin123!` |
| Student | `maya@campus.edu` | `Password123!` |
| Student | `sam@campus.edu` | `Password123!` |

End-to-end flow (once all tasks land):

1. Log in as Sam → **Report** a lost item → status `pending` (in review).
2. Log in as admin → **Security** → Publish it → `published`. (Task 5 — currently shows TODO.)
3. As Maya, save keyword `wallet` on **Alerts**. (Task 4 — currently stubbed.)
4. As Maya, open the item → **Claim** with proof → `claimed`. (Task 3 — currently shows TODO.)
5. As Sam (poster) or admin → **Verify claims** → Accept → **Mark as returned**. (Task 3.)
6. Use the home **search & filters** to find items. (Task 2 — currently unfiltered.)

## Go live with Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com), add a Web app.
2. Enable **Authentication → Email/Password**, **Firestore Database**, **Storage**.
3. Copy `.env.example` to `.env.local` and paste your `firebaseConfig` values.
4. Apply the Firestore rules sketched in [ARCHITECTURE.md](./ARCHITECTURE.md),
   create the suggested indexes, and promote your staff account (`users/{uid}.role = "admin"`).
5. Restart `npm run dev`. Demo data disappears — real Firestore takes over.

Photo uploads use Firebase Storage when configured; in demo mode small photos are
embedded locally and large ones are skipped.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run lint` | ESLint |
| `npm run build` / `npm start` | Production build / serve |

## Project layout

```
app/            pages (/, login, register, items/new, items/[id], dashboard, admin, keywords)
app/components/ Navbar, ItemCard, StatusBadge
lib/            firebase.ts (init), auth-context.tsx, data.ts (Firestore + demo fallback),
                types.ts, demo-data.ts
todo.md         per-member task breakdown (start here if you're on the team)
```

## Security & privacy

- Firebase Auth (email/password); Firestore Security Rules gate reads/writes (see ARCHITECTURE.md).
- Claim proofs visible to poster/staff/claimant only; owner identity masked for anonymous viewers.
- Photos ≤ 2MB, image MIME allowlist enforced client-side + via Storage rules.
