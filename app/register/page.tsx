"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, demoMode } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-3xl bg-navy-800 p-8 text-white lg:block">
        <div className="hero-grid absolute inset-0 bg-linear-to-br from-navy-800 via-navy-700 to-gold-600" aria-hidden />
        <div className="relative flex h-full flex-col">
          <p className="text-5xl" aria-hidden>
            🎒
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight">Join your campus lost &amp; found</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#f3ecd9]">
            One account for reporting, claiming, and alerts. {demoMode ? "Demo mode stores your profile locally." : "Powered by Firebase Auth + Firestore profiles."}
          </p>
          <ol className="mt-6 space-y-2 text-sm font-medium">
            <li className="rounded-xl bg-white/10 p-3">1️⃣ Create your account with a campus email</li>
            <li className="rounded-xl bg-white/10 p-3">2️⃣ Report a lost item or post a found one</li>
            <li className="rounded-xl bg-white/10 p-3">3️⃣ Claim with proof — get it back 🎉</li>
          </ol>
        </div>
      </div>

      <div className="card space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">Free for students &amp; staff.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input
              id="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Maya Rahman"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="email" className="label">
              Campus email
            </label>
            <input
              id="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@campus.edu"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="pw" className="label">
              Password (min 6 chars)
            </label>
            <input
              id="pw"
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              className="input"
            />
          </div>
          {error ? (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-900">
              {error}
            </p>
          ) : null}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Creating…" : "Create account →"}
          </button>
        </form>
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-navy-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
