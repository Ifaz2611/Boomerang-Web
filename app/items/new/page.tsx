"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "@/lib/auth-context";
import { createItem } from "@/lib/data";
import { storage } from "@/lib/firebase";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";

export default function NewItemPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    description: "",
    category: "electronics",
    location: "",
    eventDate: new Date().toISOString().slice(0, 10),
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  function pickFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
  }

  async function resolveImageUrl(): Promise<string | undefined> {
    if (!file) return undefined;
    if (file.size > 2 * 1024 * 1024) throw new Error("Photo must be ≤ 2MB.");
    if (storage) {
      const r = ref(storage, `items/${Date.now()}-${file.name}`);
      await uploadBytes(r, file, { contentType: file.type });
      return getDownloadURL(r);
    }
    // Demo mode: inline preview (small images persist locally).
    if (file.size > 700 * 1024) return undefined;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read photo."));
      reader.readAsDataURL(file);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Please log in to report an item.");
      return;
    }
    if (form.title.trim().length < 3) {
      setError("Give it a clear title (min 3 characters).");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Description needs a bit more detail (min 10 characters).");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const imageUrl = await resolveImageUrl();
      const item = await createItem(
        {
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          location: form.location.trim(),
          eventDate: form.eventDate,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          imageUrl,
        },
        user,
      );
      router.push(`/items/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!loading && !user) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-8 text-center">
        <p className="text-lg font-bold uppercase tracking-[0.3px] text-primary" aria-hidden>
          Sign in
        </p>
        <h1 className="text-xl font-bold tracking-[-0.45px] text-ink">Log in to report an item</h1>
        <p className="text-sm text-body">Your posts are linked to your account so claims can reach you.</p>
        <a href="/login" className="btn-primary mx-auto text-sm">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="btn-tint w-fit">New report</p>
        <h1 className="mt-2 text-3xl font-bold leading-[1.2] tracking-[-0.75px] text-ink">What happened?</h1>
        <p className="mt-1 text-sm leading-[1.63] text-body">Two minutes now saves someone a week of searching.</p>
      </div>

      <form onSubmit={submit} className="card space-y-6 p-6 sm:p-8" aria-label="Report item">
        {/* Type toggle */}
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Report type">
          {(
            [
              { v: "lost", label: "Lost", title: "I lost something", sub: "Help others spot it" },
              { v: "found", label: "Found", title: "I found something", sub: "Hold it for the owner" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={form.type === o.v}
              onClick={() => setForm({ ...form, type: o.v })}
              className={`rounded-2xl border p-4 text-left transition-all ${
                form.type === o.v
                  ? o.v === "lost"
                    ? "border-danger bg-danger/10 shadow-[rgba(244,62,92,0.2)_0px_10px_15px_-3px,rgba(244,62,92,0.2)_0px_4px_6px_-4px]"
                    : "border-teal-accent bg-teal-accent/10 shadow-[rgba(24,191,141,0.2)_0px_10px_15px_-3px,rgba(24,191,141,0.2)_0px_4px_6px_-4px]"
                  : "border-hairline bg-white hover:border-primary"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.3px] text-primary" aria-hidden>
                {o.label}
              </p>
              <p className="mt-1 font-semibold text-ink">{o.title}</p>
              <p className="text-xs text-body">{o.sub}</p>
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input id="title" required value={form.title} onChange={set("title")} placeholder="e.g. Black leather wallet with brass clasp" className="input" />
        </div>

        <div>
          <label htmlFor="desc" className="label">
            Description — where, when, distinctive marks
          </label>
          <textarea
            id="desc"
            required
            rows={4}
            value={form.description}
            onChange={set("description")}
            placeholder="Where exactly, what time, brand, color, contents… (never post full ID numbers)"
            className="input"
          />
        </div>

        <div>
          <span className="label">Category</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Category">
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_META[c]!;
              const active = form.category === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setForm({ ...form, category: c })}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold ${active ? "chip-active" : "border-hairline bg-white text-ink hover:border-primary"}`}
                >
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.3px] text-primary" aria-hidden>
                    {meta.icon}
                  </span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="loc" className="label">
              Location
            </label>
            <input id="loc" required value={form.location} onChange={set("location")} placeholder="Central Library, 2nd floor" className="input" />
          </div>
          <div>
            <label htmlFor="date" className="label">
              Date {form.type === "lost" ? "lost" : "found"}
            </label>
            <input id="date" required type="date" value={form.eventDate} onChange={set("eventDate")} className="input" />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="label">
            Tags (comma-separated)
          </label>
          <input id="tags" value={form.tags} onChange={set("tags")} placeholder="wallet, leather, black" className="input" />
        </div>

        <div>
          <label htmlFor="img" className="label">
            Photo (optional, ≤ 2MB)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-3xl">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden>No image</span>
              )}
            </div>
            <input
              id="img"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-body">
            {storage ? "Uploads to Firebase Storage." : "Demo mode: small photos are embedded; large ones are skipped."}
          </p>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}

        <button disabled={busy || loading} className={form.type === "lost" ? "btn-lost w-full !h-12 !text-base" : "btn-found w-full !h-12 !text-base"}>
          {busy ? "Posting…" : form.type === "lost" ? "Post lost item" : "Post found item"}
        </button>
        <p className="text-center text-xs text-body">
          {form.type === "lost" ? "Goes to review, then public so finders can match it." : "Held by you until the owner claims with proof."}
        </p>
      </form>
    </div>
  );
}
