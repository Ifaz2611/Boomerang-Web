"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ItemCard from "./components/ItemCard";
import { useAuth } from "@/lib/auth-context";
import { fetchItems } from "@/lib/data";
import type { Item } from "@/lib/types";

const STEPS = [
  { n: "I", title: "Report to the registry", text: "File a lost or found entry with the place, date, and distinguishing marks." },
  { n: "II", title: "Claim with proof", text: "The owner submits evidence only they would know — contents, engravings, marks." },
  { n: "III", title: "Verified return", text: "The poster or the Security Office verifies the claim and records the handover." },
];

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await fetchItems({});
      setItems(d.items);
      setTotal(d.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The registry could not be loaded. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      open: items.filter((i) => i.status === "published").length,
      claimed: items.filter((i) => i.status === "claimed").length,
      returned: items.filter((i) => i.status === "resolved").length,
    }),
    [items],
  );

  return (
    <div className="space-y-8">
      {/* University masthead */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-800 text-white" aria-labelledby="hero">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-gold-500 via-gold-300 to-gold-500" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-gold-500 via-gold-300 to-gold-500" aria-hidden />
        <div className="relative space-y-5 p-6 text-center sm:p-10">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold-500/60 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">
            Office of Student Affairs · Registry
          </p>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-b from-gold-300 to-gold-500 font-display text-3xl font-black text-navy-800 shadow-lg" aria-hidden>
            B
          </div>
          <h1 id="hero" className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight sm:text-5xl">
            Campus Lost &amp; Found Registry
          </h1>
          <p className="mx-auto h-px w-24 bg-gold-500" aria-hidden />
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            The official record of articles lost and found upon the campus. File an entry, prove ownership
            through a claim, and collect your belongings from the poster or the Security Office.
            {user ? (
              <span className="mt-1 block font-semibold text-gold-300">Welcome back, {user.name}.</span>
            ) : (
              <span className="mt-1 block">Members of the university may join with a campus email.</span>
            )}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/items/new" className="btn-gold text-sm">
              ✒ File a registry entry
            </Link>
            <Link href="#registry" className="btn-outline-light text-sm">
              View the notice board ↓
            </Link>
          </div>

          <dl className="mx-auto flex max-w-lg justify-center gap-8 border-t border-white/15 pt-4" role="status">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Open entries</dt>
              <dd className="font-display text-2xl font-bold text-gold-300">{loading ? "…" : stats.open}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Under claim</dt>
              <dd className="font-display text-2xl font-bold text-gold-300">{loading ? "…" : stats.claimed}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Restored</dt>
              <dd className="font-display text-2xl font-bold text-gold-300">{loading ? "…" : stats.returned}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Registry procedure */}
      <section aria-label="How the registry works" className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="card p-5">
            <p className="font-display text-3xl font-bold text-gold-500" aria-hidden>
              {s.n}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-navy-800">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
          </div>
        ))}
      </section>

      {/* TODO (Kazi Abtahi): Search, filters & sorting — see todo.md Task 2.
          Build a filter bar (query, type lost/found, category, location,
          date range, tags + sort) that calls fetchItems(filters) and updates
          the notice board below. Keep it client-side + Firestore compatible. */}
      <section aria-label="Search and filters (to be implemented)" className="card space-y-3 border-dashed p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-bold text-navy-800">🔍 Search &amp; filters</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
            TODO · assigned: Kazi Abtahi
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Search and filtering are not implemented yet. This board currently shows all public entries
          unfiltered. The assignee should add a search box + filters here (see <code>todo.md</code>).
        </p>
        <div className="flex flex-wrap gap-2 opacity-60" aria-hidden>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Search items…
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Type: lost / found
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Category
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Location + dates
          </span>
        </div>
      </section>

      {/* Notice board */}
      <section id="registry" aria-labelledby="registry-h" className="scroll-mt-24 space-y-4">
        <div className="flex items-end gap-3 border-b-2 border-navy-800 pb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">Notice board</p>
            <h2 id="registry-h" className="font-display text-2xl font-bold text-navy-800 sm:text-3xl">
              Current entries
            </h2>
          </div>
          <span className="ml-auto text-sm font-semibold text-slate-500" role="status">
            {total} entr{total === 1 ? "y" : "ies"} on record
          </span>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading registry entries">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-80" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <p className="font-display text-5xl text-gold-500" aria-hidden>
              ❦
            </p>
            <h3 className="font-display text-xl font-bold text-navy-800">The board is clear</h3>
            <p className="max-w-sm text-sm text-slate-600">
              No entries are presently on record. Should you lose or find an article, file an entry and
              it shall be posted here.
            </p>
            <div className="flex gap-2">
              <Link href="/items/new" className="btn-primary text-sm">
                File an entry
              </Link>
              <Link href="/keywords" className="btn-ghost text-sm">
                Request notification
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
