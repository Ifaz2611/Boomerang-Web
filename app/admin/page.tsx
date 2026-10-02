"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { fetchItems, setItemStatus } from "@/lib/data";
import type { Item, ItemStatus } from "@/lib/types";

const TABS: ItemStatus[] = ["pending", "published", "claimed", "resolved", "rejected"];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<ItemStatus>("pending");
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(true);

  async function load(status: ItemStatus) {
    setBusy(true);
    setMsg("");
    try {
      const [queued, all] = await Promise.all([
        fetchItems({ status }),
        fetchItems({}).catch(() => ({ items: [] as Item[], total: 0 })),
      ]);
      setItems(queued.items);
      const c: Record<string, number> = {};
      for (const it of [...queued.items, ...all.items]) c[it.status] = (c[it.status] ?? 0) + 1;
      setCounts(c);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to load queue.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && user?.role === "admin") load(tab);
    else if (!loading) setBusy(false);
  }, [tab, user, loading]);

  async function update(id: string, status: ItemStatus) {
    setMsg("");
    try {
      await setItemStatus(id, status);
      setMsg(`✅ Item → ${status}.`);
      await load(tab);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Update failed.");
    }
  }

  if (!loading && (!user || user.role !== "admin")) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-8 text-center">
        <p className="text-4xl" aria-hidden>
          🛡
        </p>
        <h1 className="text-xl font-black">Security office only</h1>
        <p className="text-sm text-slate-500">
          Log in with a staff account{!user ? " to moderate listings" : " — your account isn't staff"}.
          {user ? "" : " In demo mode use admin@campus.edu / Admin123!."}
        </p>
        {!user ? (
          <Link href="/login" className="btn-primary mx-auto text-sm">
            Go to login
          </Link>
        ) : (
          <Link href="/" className="btn-ghost mx-auto text-sm">
            Back to browse
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#8a6d1c]">Moderation</p>
        <h1 className="text-3xl font-black tracking-tight">🛡 Security office</h1>
        <p className="mt-1 text-sm text-slate-500">Review new reports, publish them, and resolve handovers.</p>
      </div>

      <div role="tablist" aria-label="Moderation queues" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t ? "chip-active" : "card hover:border-[#c19a2e]"}`}
          >
            {t} · {counts[t] ?? 0}
          </button>
        ))}
      </div>

      {msg ? (
        <p role="status" className="card p-3 text-sm font-medium">
          {msg}
        </p>
      ) : null}

      {busy ? (
        <div className="space-y-2">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl" aria-hidden>
            ✨
          </p>
          <p className="mt-2 font-extrabold">Queue clear</p>
          <p className="text-sm text-slate-500">Nothing in “{tab}” right now.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/items/${it.id}`} className="font-extrabold hover:text-[#1d4a7a] hover:underline">
                  {it.title}
                </Link>
                <p className="truncate text-xs text-slate-500">
                  {it.type} · {it.location} · {it.eventDate} · by {it.ownerName}
                </p>
              </div>
              <StatusBadge status={it.status} />
              <span className="flex gap-1.5">
                <button onClick={() => update(it.id, "published")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                  Publish
                </button>
                <button onClick={() => update(it.id, "rejected")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">
                  Reject
                </button>
                <button onClick={() => update(it.id, "resolved")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">
                  Resolve
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
