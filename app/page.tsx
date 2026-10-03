"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ItemCard from "./components/ItemCard";
import { useAuth } from "@/lib/auth-context";
import { fetchItems } from "@/lib/data";
import type { Item } from "@/lib/types";

const STEPS = [
  { n: "01", title: "Report in seconds", text: "File a lost or found entry with place, date, and distinguishing marks." },
  { n: "02", title: "Claim with proof", text: "Owners submit evidence only they would know — contents, marks, engravings." },
  { n: "03", title: "Verified return", text: "The poster or Security Office verifies the claim and records the handover." },
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
      setError(e instanceof Error ? e.message : "We couldn't load the board. Please try again.");
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
    <div className="space-y-14">
      {/* Hero */}
      <section className="hero-band relative overflow-hidden rounded-2xl px-4 py-16 text-center sm:px-6" aria-labelledby="hero">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-3xl space-y-5">
          <p className="btn-tint mx-auto w-fit">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-hidden /> Lost &amp; Found Portal
          </p>
          <h1 id="hero" className="display-hero text-ink">
            Lost it? Found it?
            <span className="block bg-gradient-to-r from-primary via-cyan-accent to-teal-accent bg-clip-text text-transparent">
              Let&apos;s bring it home.
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-xl font-normal leading-[1.4] text-body">
            The friendly campus recovery network. File an entry, prove ownership through a claim, and arrange a verified return.
            {user ? (
              <span className="mt-1 block text-xl font-bold tracking-[-0.5px] text-ink">Welcome back, {user.name}.</span>
            ) : (
              <span className="mt-1 block">Students and staff can join with a campus email.</span>
            )}
          </p>

          <form
            role="search"
            aria-label="Quick search"
            className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-hairline bg-white p-2 pl-5 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("registry")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span aria-hidden className="text-body">Search</span>
            <label htmlFor="hero-search" className="sr-only">
              Search lost and found items
            </label>
            <input id="hero-search" placeholder="Try “wallet”, “keys”, “airpods”…" className="w-full bg-transparent text-base text-ink outline-none placeholder:text-[rgba(103,103,126,0.5)]" />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/items/new?type=found" className="btn-found !h-12 !px-8 !text-base">
              Report found
            </Link>
            <Link href="/items/new?type=lost" className="btn-lost !h-12 !px-8 !text-base">
              Report lost
            </Link>
          </div>

          <dl className="mx-auto flex max-w-lg justify-center gap-8 pt-2" role="status">
            {[
              { label: "Open entries", v: stats.open },
              { label: "Under claim", v: stats.claimed },
              { label: "Reunited", v: stats.returned },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-[12px] font-semibold uppercase tracking-[0.3px] text-body">{s.label}</dt>
                <dd className="text-xl font-bold tracking-[-0.5px] text-ink">{loading ? "…" : s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section aria-label="How it works" className="grid gap-8 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="card p-6">
            <p className="btn-tint w-fit" aria-hidden>
              {s.n}
            </p>
            <h2 className="mt-3 text-lg font-semibold leading-[1.56] tracking-[-0.45px] text-ink">{s.title}</h2>
            <p className="mt-1 text-sm leading-[1.63] text-body">{s.text}</p>
          </div>
        ))}
      </section>

      {/* TODO (Kazi Abtahi): Search, filters & sorting — see todo.md Task 2.
          Build a filter bar (query, type lost/found, category, location,
          date range, tags + sort) that calls fetchItems(filters) and updates
          the notice board below. Keep it client-side + Firestore compatible. */}
      <section aria-label="Search and filters (to be implemented)" className="card space-y-3 border-dashed !bg-white/60 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-[-0.45px] text-ink">Search &amp; filters</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
            TODO · assigned: Kazi Abtahi
          </span>
        </div>
        <p className="text-sm leading-relaxed text-body">
          Search and filtering are not implemented yet. This board currently shows all public entries
          unfiltered. The assignee should add a search box + filters here (see <code>todo.md</code>).
        </p>
        <div className="flex flex-wrap gap-2 opacity-60" aria-hidden>
          {["Search items…", "Type: lost / found", "Category", "Location + dates"].map((t) => (
            <span key={t} className="rounded-full border border-hairline bg-white px-4 py-2 text-sm text-body">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Recent reports */}
      <section id="registry" aria-labelledby="registry-h" className="scroll-mt-24 space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="btn-tint w-fit">Recent reports</p>
            <h2 id="registry-h" className="mt-2 text-3xl font-bold leading-[1.2] tracking-[-0.75px] text-ink">
              Fresh from the community
            </h2>
          </div>
          <span className="ml-auto text-sm font-medium text-body" role="status">
            {total} {total === 1 ? "item" : "items"} on record
          </span>
        </div>

        {error ? (
          <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading entries">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-80" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <p className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(124,59,237,0.15)] text-sm font-bold uppercase tracking-[0.3px] text-primary" aria-hidden>
              No entries
            </p>
            <h3 className="text-xl font-bold tracking-[-0.5px] text-ink">All clear — nothing lost right now</h3>
            <p className="max-w-sm text-sm leading-relaxed text-body">
              No entries are on record. Lost or found something? File it and it will show up here.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/items/new" className="btn-primary !h-12 !text-base">
                File an entry
              </Link>
              <Link href="/keywords" className="btn-ghost !h-12 !rounded-full">
                Get notified
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
