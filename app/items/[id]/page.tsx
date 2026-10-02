"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { decideClaim, getItemDetail, setItemStatus, submitClaim } from "@/lib/data";
import { CATEGORY_META, type Claim, type Item, type ItemStatus } from "@/lib/types";

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState("");
  const [proof, setProof] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const isOwnerOrAdmin = !!user && !!item && (user.uid === item.ownerId || user.role === "admin");
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
    setMsg("");
    if (!user) {
      setMsg("Please log in to submit a claim.");
      return;
    }
    if (proof.trim().length < 10) {
      setMsg("Describe your proof with a bit more detail (min 10 characters).");
      return;
    }
    setBusy(true);
    try {
      await submitClaim(id, proof.trim(), contactNote.trim() || undefined, user);
      setMsg("✅ Claim sent! The poster / security office will verify your proof.");
      setProof("");
      setContactNote("");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDecide(claimId: string, decision: "accepted" | "rejected") {
    setMsg("");
    try {
      await decideClaim(id, claimId, decision);
      setMsg(decision === "accepted" ? "🎉 Claim accepted — arrange the handover!" : "Claim rejected.");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  async function onStatus(status: ItemStatus) {
    setMsg("");
    try {
      await setItemStatus(id, status);
      setMsg(status === "resolved" ? "🎉 Marked as returned. Nicely boomeranged!" : `Status → ${status}.`);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Update failed.");
    }
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
      <Link href="/" className="text-sm font-bold text-slate-500 hover:text-[#1d4a7a]">
        ← Back to browse
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="relative h-64 bg-gradient-to-br from-[#e8e0cb] via-[#f6f1e6] to-[#e8cf7a]/50 sm:h-80">
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
            {isOwnerOrAdmin && ["published", "claimed"].includes(item.status) ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={() => onStatus("resolved")} className="btn-primary text-sm">
                  ✅ Mark as returned
                </button>
                {user?.role === "admin" ? (
                  <button onClick={() => onStatus("rejected")} className="btn-ghost text-sm">
                    Reject listing
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <section aria-labelledby="claim-h" className="card space-y-3 p-5">
            <h2 id="claim-h" className="font-extrabold">
              🙋 Claim this item
            </h2>
            <p className="text-xs leading-relaxed text-slate-500">
              Describe proof only the owner would know — engraving, contents, sticker details, partial ID…
            </p>
            <form onSubmit={onClaim} className="space-y-3">
              <div>
                <label htmlFor="proof" className="label">
                  Owner proof
                </label>
                <textarea
                  id="proof"
                  rows={3}
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  placeholder="e.g. Black bifold, metro card ending 441, photo of my dog inside…"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="contact" className="label">
                  Meetup note (optional)
                </label>
                <input
                  id="contact"
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  placeholder="e.g. Library front desk after 4pm"
                  className="input"
                />
              </div>
              <button disabled={busy} className="btn-primary w-full text-sm">
                {busy ? "Sending…" : "Submit claim"}
              </button>
            </form>
          </section>

          {isOwnerOrAdmin ? (
            <section aria-labelledby="verify-h" className="card space-y-3 p-5">
              <h2 id="verify-h" className="font-extrabold">
                🛡 Verify claims ({claims.length})
              </h2>
              {claims.length === 0 ? (
                <p className="text-sm text-slate-500">No claims yet — share the listing so the owner can find it.</p>
              ) : (
                <ul className="space-y-2">
                  {claims.map((c) => (
                    <li key={c.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                      <p className="flex items-center justify-between">
                        <strong>{c.claimantName}</strong>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            c.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : c.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.status}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        <strong>Proof:</strong> {c.proof}
                      </p>
                      {c.contactNote ? (
                        <p className="mt-1 text-sm">
                          <strong>Meetup:</strong> {c.contactNote}
                        </p>
                      ) : null}
                      {c.status === "pending" ? (
                        <p className="mt-2 flex gap-2">
                          <button onClick={() => onDecide(c.id, "accepted")} className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                            Accept
                          </button>
                          <button onClick={() => onDecide(c.id, "rejected")} className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">
                            Reject
                          </button>
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

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
