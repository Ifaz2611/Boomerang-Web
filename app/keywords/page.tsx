"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// TODO (Mirza Rafi): Keyword alerts + notifications — see todo.md Task 4.
// This page is intentionally stubbed. Re-implement using:
//   listKeywords / addKeyword / removeKeyword /
//   listNotifications / markAllRead from lib/data.ts
// (those functions currently throw TODO — implement them too).

const SUGGESTIONS = ["wallet", "calculator", "airpods", "student id", "keys", "backpack"];

export default function KeywordsPage() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-8 text-center">
        <p className="text-4xl" aria-hidden>
          🔔
        </p>
        <h1 className="text-xl font-bold tracking-[-0.45px] text-ink">Log in to use alerts</h1>
        <p className="text-sm text-body">Save keywords like “wallet” and get pinged on every match.</p>
        <Link href="/login" className="btn-primary mx-auto text-sm">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <p className="btn-tint w-fit">Alerts</p>
          <h1 className="mt-2 text-3xl font-bold leading-[1.2] tracking-[-0.75px] text-ink">Never miss a match</h1>
          <p className="mt-1 text-sm leading-[1.63] text-body">Save keywords — new posts matching them show up below.</p>
        </div>
        <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
          TODO · assigned: Mirza Rafi
        </span>
      </div>

      <div className="card space-y-3 border-dashed p-5" role="status">
        <h2 className="text-lg font-semibold tracking-[-0.45px] text-ink">Keyword alerts are under construction</h2>
        <p className="text-sm leading-[1.63] text-body">
          This feature was rolled back so it can be built as a team contribution. If you are{" "}
          <strong>Mirza Rafi</strong>, implement it per <code>todo.md → Task 4</code>: keyword CRUD,
          suggestion chips, match list with unread badge, and “mark all read”. Data helpers in{" "}
          <code>lib/data.ts</code> currently throw <code>TODO</code> — implement them first, then wire
          this page.
        </p>
      </div>

      {/* Disabled placeholder form — replaced by real implementation in Task 4. */}
      <form onSubmit={(e) => e.preventDefault()} className="card flex gap-2 p-3 opacity-60" aria-label="Save keyword (placeholder)">
        <label htmlFor="kw-todo" className="sr-only">
          Keyword
        </label>
        <input id="kw-todo" disabled placeholder="e.g. wallet, airpods, calculator… (coming soon)" className="input" />
        <button disabled className="btn-primary shrink-0 text-sm opacity-60" title="Not implemented yet">
          ＋ Save (soon)
        </button>
      </form>

      <div className="flex flex-wrap gap-2 opacity-60" aria-label="Suggestions (placeholder)">
        <span className="py-1.5 text-xs font-bold text-slate-400">Try:</span>
        {SUGGESTIONS.map((s) => (
          <span key={s} className="rounded-full border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-body">
            {s}
          </span>
        ))}
      </div>

      <div className="card p-5 opacity-70">
        <h2 className="text-lg font-semibold tracking-[-0.45px] text-ink">My keywords (0)</h2>
        <p className="mt-2 text-sm text-body">No keywords yet — saving is disabled until Task 4 is done.</p>
      </div>

      <section aria-label="Matches (placeholder)" className="card space-y-2 p-5 opacity-70">
        <h2 className="text-lg font-semibold tracking-[-0.45px] text-ink">Matches</h2>
        <p className="text-sm text-body">No matches yet. New posts will be checked against keywords automatically once implemented.</p>
      </section>
    </div>
  );
}
