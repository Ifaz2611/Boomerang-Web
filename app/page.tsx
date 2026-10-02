"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ItemCard from "./components/ItemCard";
import { useAuth } from "@/lib/auth-context";
import { fetchItems } from "@/lib/data";
import { CATEGORIES, CATEGORY_META, type Item } from "@/lib/types";

const TYPE_TABS = [
  { value: "", label: "Everything" },
  { value: "lost", label: "🔍 Lost" },
  { value: "found", label: "✋ Found" },
] as const;

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | "lost" | "found">("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function search(next?: { query?: string; type?: string; category?: string; location?: string }) {
    setLoading(true);
    setError("");
    try {
      const d = await fetchItems({
        query: next?.query ?? query,
        type: (next?.type ?? type) as "" | "lost" | "found",
        category: next?.category ?? category,
        location: next?.location ?? location,
      });
      setItems(d.items);
      setTotal(d.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed. Check your Firebase config.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search({ query: "", type: "", category: "", location: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white" aria-labelledby="hero">
        <div className="hero-grid absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800" aria-hidden />
        <div
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-400/30 blur-3xl"
          aria-hidden
        />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
        <div className="relative space-y-5 p-6 sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            🎓 Made for campus life
          </p>
          <h1 id="hero" className="max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Lost it? Found it? <span className="text-teal-300">Boomerang</span> brings it back.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
            Post a lost or found item in seconds, prove ownership with a claim, and get pinged the moment a match
            appears. {user ? `Welcome back, ${user.name.split(" ")[0]}!` : "Join with your campus email to get started."}
          </p>

          <form
            role="search"
            aria-label="Search items"
            className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
          >
            <label htmlFor="hero-q" className="sr-only">
              Search items
            </label>
            <input
              id="hero-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “wallet”, “calculator”, “student id”…"
              className="flex-1 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading}>
              {loading ? "Searching…" : "🔎 Search"}
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setType(t.value as "" | "lost" | "found");
                  search({ type: t.value });
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold backdrop-blur transition-colors ${
                  type === t.value ? "bg-white text-slate-900" : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto hidden items-center gap-4 text-xs font-semibold text-indigo-100 sm:flex" role="status">
              <span>🟢 {stats.open} open</span>
              <span>🔵 {stats.claimed} claimed</span>
              <span>✅ {stats.returned} returned</span>
            </span>
          </div>
        </div>
      </section>

      {/* Category rail */}
      <section aria-label="Browse by category" className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setCategory("");
            search({ category: "" });
          }}
          className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-bold ${!category ? "chip-active border-slate-900" : "border-slate-200 bg-white hover:border-indigo-300"}`}
        >
          ✨ All
        </button>
        {CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c]!;
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                const next = active ? "" : c;
                setCategory(next);
                search({ category: next });
              }}
              className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-bold ${active ? "chip-active border-slate-900" : "border-slate-200 bg-white hover:border-indigo-300"}`}
            >
              {meta.icon} {meta.label}
            </button>
          );
        })}
      </section>

      {/* Location filter */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="loc" className="label">
            📍 Location
          </label>
          <input
            id="loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Library, Block A, shuttle…"
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => search()} className="btn-primary text-sm" disabled={loading}>
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setType("");
              setCategory("");
              setLocation("");
              search({ query: "", type: "", category: "", location: "" });
            }}
            className="btn-ghost text-sm"
          >
            Reset
          </button>
          <button type="button" onClick={() => setShowFilters((v) => !v)} className="btn-ghost text-sm sm:hidden">
            {showFilters ? "Hide" : "Filters"}
          </button>
        </div>
        <span className="text-sm font-semibold text-slate-400 sm:ml-auto" role="status">
          {total} result{total === 1 ? "" : "s"}
        </span>
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading items">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-80" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-5xl" aria-hidden>
            🪃
          </p>
          <h2 className="text-lg font-extrabold">Nothing found — yet</h2>
          <p className="max-w-sm text-sm text-slate-500">
            No items match those filters. Be the first to report one, or save a keyword alert and we&apos;ll ping you
            when it shows up.
          </p>
          <div className="flex gap-2">
            <Link href="/items/new" className="btn-primary text-sm">
              Report an item
            </Link>
            <Link href="/keywords" className="btn-ghost text-sm">
              Set an alert
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
    </div>
  );
}
