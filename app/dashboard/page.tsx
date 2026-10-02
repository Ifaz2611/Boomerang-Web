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
        <p className="text-4xl" aria-hidden>
          🗂
        </p>
        <h1 className="text-xl font-black">Log in to see your posts</h1>
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
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Dashboard</p>
          <h1 className="text-3xl font-black tracking-tight">My posts</h1>
        </div>
        <Link href="/items/new" className="btn-primary ml-auto text-sm">
          ＋ Report an item
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "⏳", n: pending, label: "In review" },
          { icon: "🟢", n: open, label: "Open" },
          { icon: "🎉", n: done, label: "Returned" },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <span className="text-2xl" aria-hidden>
              {s.icon}
            </span>
            <span>
              <span className="block text-2xl font-black">{busy ? "…" : s.n}</span>
              <span className="text-xs font-semibold text-slate-500">{s.label}</span>
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
          <p className="text-4xl" aria-hidden>
            🪃
          </p>
          <p className="mt-2 font-extrabold">Nothing posted yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
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
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${m.type === "lost" ? "bg-rose-100" : "bg-teal-100"}`} aria-hidden>
                {m.type === "lost" ? "🔍" : "✋"}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/items/${m.id}`} className="truncate font-extrabold hover:text-indigo-700">
                  {m.title}
                </Link>
                <p className="truncate text-xs text-slate-500">
                  {m.type} · {m.location} · {m.eventDate}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-400">Open an item to review its claims and mark it returned.</p>
    </div>
  );
}
