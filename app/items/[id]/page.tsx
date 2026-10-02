"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { getItemDetail } from "@/lib/data";
import { CATEGORY_META, type Claim, type Item } from "@/lib/types";

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // TODO (Tausiful Islam): Claim + verify workflow — see todo.md Task 3.
  // Re-implement: claim form state (proof, contactNote), submitClaim(),
  // verify list with accept/reject (decideClaim()), and "Mark as returned"
  // (setItemStatus "resolved"). Data stubs live in lib/data.ts.
  const isOwnerOrAdmin = !!user && !!item && (user.uid === item.ownerId || user.role === "admin");
  void claims;
  void isOwnerOrAdmin;
  const meta = item ? (CATEGORY_META[item.category] ?? CATEGORY_META.other!) : null;

  async function load() {
    setError("");
    try {
      const d = await getItemDetail(id);
      if (!d) {
        setError("Item not found. It may have been removed.");
        return;
      }
      setItem(d.item);
      setClaims(d.claims);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onClaim(e: React.FormEvent) {
    e.preventDefault();
    // TODO (Tausiful Islam): wire this form to submitClaim() with validation
    // (min 10 chars proof, login required) + reload detail. See todo.md Task 3.
    setMsg("🚧 Claiming is not implemented yet — assigned to Tausiful Islam (see todo.md Task 3).");
  }

  async function onDecide(_claimId: string, _decision: "accepted" | "rejected") {
    // TODO (Tausiful Islam): wire to decideClaim() + reload. See todo.md Task 3.
    void _claimId;
    void _decision;
    setMsg("🚧 Claim verification is not implemented yet — assigned to Tausiful Islam (see todo.md Task 3).");
  }

  async function onStatus(_status: string) {
    // TODO (Tausiful Islam): wire "Mark as returned" to setItemStatus(id, "resolved").
    void _status;
    setMsg("🚧 Mark-as-returned is not implemented yet — assigned to Tausiful Islam (see todo.md Task 3).");
  }

  if (error)
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
        <Link href="/" className="btn-ghost mt-4 text-sm">
          ← Back to browse
        </Link>
      </div>
    );
  if (!item)
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="skeleton h-72" />
        <div className="skeleton h-40" />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/" className="text-sm font-bold text-slate-500 hover:text-navy-700">
        ← Back to browse
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="relative h-64 bg-linear-to-br from-[#e8e0cb] via-parchment to-gold-300/50 sm:h-80">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={`Photo of ${item.title}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl" aria-hidden>
                {meta!.icon}
              </div>
            )}
            <div className="absolute left-4 top-4 flex gap-1.5">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ${
                  item.type === "lost" ? "bg-[#7a1f1f]" : "bg-[#1f5c3d]"
                }`}
              >
                {item.type}
              </span>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <div className="space-y-3 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {meta!.icon} {meta!.label} · {item.eventDate}
            </p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{item.title}</h1>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600">{item.description}</p>
            {item.tags.length ? (
              <p className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    #{t}
                  </span>
                ))}
              </p>
            ) : null}
            <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
              <p>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Location</span>
                <span className="font-semibold">📍 {item.location}</span>
              </p>
              <p>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Posted by</span>
                <span className="font-semibold">👤 {item.ownerName}</span>
              </p>
              <p>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Date</span>
                <span className="font-semibold">📅 {item.eventDate}</span>
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Privacy: contact details stay hidden until a claim is accepted. Never share full ID numbers publicly.
            </p>
            {/* TODO (Tausiful Islam): "Mark as returned" — owner/admin sets status → resolved.
                See todo.md Task 3. Intentionally disabled until implemented. */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 pt-3">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                TODO · Tausiful Islam
              </span>
              <button onClick={() => onStatus("resolved")} className="btn-primary text-sm opacity-60" title="Not implemented yet">
                ✅ Mark as returned (coming soon)
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar — TODO (Tausiful Islam): full claim + verify workflow. See todo.md Task 3. */}
        <div className="space-y-5">
          <section aria-labelledby="claim-h" className="card space-y-3 border-dashed p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="claim-h" className="font-extrabold">
                🙋 Claim this item
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                TODO · Tausiful Islam
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Claiming is not implemented yet. The assignee should add owner-proof + meetup-note
              fields here and wire them to <code>submitClaim()</code> (see <code>todo.md</code> Task 3).
            </p>
            <form onSubmit={onClaim} className="space-y-3 opacity-60" aria-label="Claim form (placeholder)">
              <div>
                <label htmlFor="proof-todo" className="label">
                  Owner proof (disabled placeholder)
                </label>
                <textarea id="proof-todo" rows={3} disabled placeholder="e.g. Black bifold, metro card ending 441…" className="input" />
              </div>
              <button type="submit" className="btn-primary w-full text-sm">
                Submit claim (coming soon)
              </button>
            </form>
          </section>

          <section aria-labelledby="verify-h" className="card space-y-3 border-dashed p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="verify-h" className="font-extrabold">
                🛡 Verify claims
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                TODO · Tausiful Islam
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Claim verification (accept / reject via <code>decideClaim()</code>) is not implemented yet.
              Poster / staff will review claims here once built.
            </p>
            <div className="flex gap-2 opacity-60" aria-hidden>
              <span className="flex-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-center text-xs font-bold text-emerald-800">
                Accept (soon)
              </span>
              <span className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-xs font-bold text-slate-500">
                Reject (soon)
              </span>
            </div>
            {/* Keep handlers referenced so future wiring is obvious. */}
            <span className="hidden">
              <button onClick={() => onDecide("placeholder", "accepted")}>accept</button>
            </span>
          </section>

          {msg ? (
            <p role="status" className="card p-4 text-sm font-medium">
              {msg}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
