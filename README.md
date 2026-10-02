# Boomerang — Campus Lost & Found (Firebase edition)

Report **Lost/Found** posts, **search with filters**, submit **claims with owner proof**,
**verify claims**, **moderate** as security office, and get **keyword alerts** —
with **Firebase Auth + Firestore + Storage** and zero custom backend.

## Quick start (2 minutes, no Firebase needed)

```bash
npm install
npm run dev      # http://localhost:3000
```

The app runs in **demo mode** (local data + local auth) until you add Firebase keys.

Demo accounts (demo mode):

| Role | Email | Password |
|---|---|---|
| Security office (staff) | `admin@campus.edu` | `Admin123!` |
| Student | `maya@campus.edu` | `Password123!` |
| Student | `sam@campus.edu` | `Password123!` |

End-to-end flow:

1. Log in as Sam → **Report** a lost item → status `pending` (in review).
2. Log in as admin → **Security** → Publish it → `published`.
3. As Maya, save keyword `wallet` on **Alerts**.
4. As Maya, open the item → **Claim** with proof → `claimed`.
5. As Sam (poster) or admin → **Verify claims** → Accept → **Mark as returned**.

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
```

## Security & privacy

- Firebase Auth (email/password); Firestore Security Rules gate reads/writes (see ARCHITECTURE.md).
- Claim proofs visible to poster/staff/claimant only; owner identity masked for anonymous viewers.
- Photos ≤ 2MB, image MIME allowlist enforced client-side + via Storage rules.
