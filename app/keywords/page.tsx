"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addKeyword, listKeywords, listNotifications, markAllRead, removeKeyword } from "@/lib/data";
import type { AppNotification, SavedKeyword } from "@/lib/types";

const SUGGESTIONS = ["wallet", "calculator", "airpods", "student id", "keys", "backpack"];

export default function KeywordsPage() {
  const { user, loading } = useAuth();
  const [keywords, setKeywords] = useState<SavedKeyword[]>([]);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(true);

  async function load() {
    if (!user) {
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const k = await listKeywords(user.uid);
      setKeywords(k);
      const n = await listNotifications(user.uid);
      setNotifs(n.notifications);
      setUnread(n.unread);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not load alerts.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !input.trim()) return;
    setMsg("");
    try {
      await addKeyword(user.uid, input);
      setInput("");
      setMsg("🔔 Keyword saved — we'll flag new matches here.");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  if (!loading && !user) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-8 text-center">
        <p className="text-4xl" aria-hidden>
          🔔
        </p>
        <h1 className="text-xl font-black">Log in to use alerts</h1>
        <p className="text-sm text-slate-500">Save keywords like “wallet” and get pinged on every match.</p>
        <Link href="/login" className="btn-primary mx-auto text-sm">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#8a6d1c]">Alerts</p>
        <h1 className="text-3xl font-black tracking-tight">Never miss a match</h1>
        <p className="mt-1 text-sm text-slate-500">Save keywords — new posts matching them show up below.</p>
      </div>

      {msg ? (
        <p role="status" className="card p-3 text-sm font-medium">
          {msg}
        </p>
      ) : null}

      <form onSubmit={add} className="card flex gap-2 p-3" aria-label="Save keyword">
        <label htmlFor="kw" className="sr-only">
          Keyword
        </label>
        <input
          id="kw"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          minLength={2}
          placeholder="e.g. wallet, airpods, calculator…"
          className="input"
        />
        <button className="btn-primary shrink-0 text-sm">＋ Save</button>
      </form>

      <div className="flex flex-wrap gap-2" aria-label="Suggestions">
        <span className="py-1.5 text-xs font-bold text-slate-400">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setInput(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-[#c19a2e]"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-extrabold">My keywords ({keywords.length})</h2>
        {busy ? (
          <div className="skeleton mt-3 h-10" />
        ) : keywords.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No keywords yet — save your first one above.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li
                key={k.id}
                className="flex items-center gap-2 rounded-full bg-[#f3ecd9] py-1.5 pl-3 pr-2 text-sm font-bold text-[#0e2a47]"
              >
                🔎 {k.keyword}
                <button
                  onClick={async () => {
                    await removeKeyword(k.id);
                    await load();
                  }}
                  aria-label={`Remove ${k.keyword}`}
                  className="rounded-full bg-white px-2 text-slate-500 hover:text-rose-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section aria-labelledby="n-h" className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 id="n-h" className="font-extrabold">
            Matches {unread > 0 ? <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">{unread} new</span> : null}
          </h2>
          <button
            onClick={async () => {
              if (user) {
                await markAllRead(user.uid);
                await load();
              }
            }}
            className="btn-ghost ml-auto !py-1.5 text-xs"
          >
            Mark all read
          </button>
        </div>
        {busy ? (
          <div className="space-y-2">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl" aria-hidden>
              📭
            </p>
            <p className="mt-2 text-sm text-slate-500">No matches yet. New posts are checked against your keywords automatically.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifs.map((n) => (
              <li key={n.id} className={`card p-4 text-sm ${n.read ? "opacity-70" : "border-[#c19a2e]"}`}>
                <Link href={`/items/${n.itemId}`} className="font-bold hover:text-[#1d4a7a] hover:underline">
                  {n.message}
                </Link>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString()} · keyword “{n.keyword}”
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
