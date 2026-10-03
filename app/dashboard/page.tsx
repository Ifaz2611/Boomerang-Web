"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { fetchItems } from "@/lib/data";
import type { Item } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [mine, setMine] = useState<Item[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading || !user) {
      setBusy(false);
      return;
    }
    setBusy(true);
    fetchItems({ ownerId: user.uid, status: "" })
      .then((d) => setMine(d.items))
      .catch(() => setMine([]))
      .finally(() => setBusy(false));
  }, [user, loading]);

  if (!loading && !user) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-8 text-center">
        <p className="text-lg font-bold uppercase tracking-[0.3px] text-primary" aria-hidden>
          My posts
        </p>
        <h1 className="text-xl font-bold tracking-[-0.45px] text-ink">Log in to see your posts</h1>
        <Link href="/login" className="btn-primary mx-auto text-sm">
          Go to login
        </Link>
      </div>
    );
  }

  const pending = mine.filter((m) => m.status === "pending").length;
  const open = mine.filter((m) => m.status === "published").length;
  const done = mine.filter((m) => m.status === "resolved").length;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="btn-tint w-fit">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold leading-[1.2] tracking-[-0.75px] text-ink">My posts</h1>
        </div>
        <Link href="/items/new" className="btn-primary ml-auto text-sm">
          Report an item
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { n: pending, label: "In review" },
          { n: open, label: "Open" },
          { n: done, label: "Returned" },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <span>
              <span className="block text-2xl font-bold tracking-[-0.5px] text-ink">{busy ? "…" : s.n}</span>
              <span className="text-xs font-semibold text-body">{s.label}</span>
            </span>
          </div>
        ))}
      </div>

      {busy ? (
        <div className="space-y-2">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : mine.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3px] text-primary" aria-hidden>
            No posts yet
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">Nothing posted yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-[1.63] text-body">
            Lost something on campus? Post it and let finders come to you. Found something? Hold it and post it here.
          </p>
          <Link href="/items/new" className="btn-primary mx-auto mt-4 text-sm">
            Report your first item
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {mine.map((m) => (
            <li key={m.id} className="card flex items-center gap-3 p-4">
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase tracking-[0.3px] ${m.type === "lost" ? "bg-danger/15" : "bg-teal-accent/15"}`} aria-hidden>
                {m.type === "lost" ? "Lost" : "Found"}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/items/${m.id}`} className="truncate font-semibold text-ink hover:text-primary hover:underline">
                  {m.title}
                </Link>
                <p className="truncate text-xs text-body">
                  {m.type} · {m.location} · {m.eventDate}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-body">Open an item to review its claims and mark it returned.</p>
    </div>
  );
}
