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
      <div className="hero-band relative hidden overflow-hidden rounded-2xl border border-hairline p-8 lg:block">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative flex h-full flex-col">
          <p className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-[rgba(124,59,237,0.2)_0px_10px_15px_-3px,rgba(124,59,237,0.2)_0px_4px_6px_-4px]" aria-hidden>
            🎒
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-[1.2] tracking-[-0.75px] text-ink">Join the recovery network</h1>
          <p className="mt-2 text-sm leading-[1.63] text-body">
            One account for reporting, claiming, and alerts. {demoMode ? "Demo mode stores your profile locally." : "Powered by Firebase Auth + Firestore profiles."}
          </p>
          <ol className="mt-6 space-y-2 text-sm font-medium text-ink">
            <li className="card !rounded-xl p-3">1️⃣ Create your account with a campus email</li>
            <li className="card !rounded-xl p-3">2️⃣ Report a lost item or post a found one</li>
            <li className="card !rounded-xl p-3">3️⃣ Claim with proof — get it back 🎉</li>
          </ol>
        </div>
      </div>

      <div className="card space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.75px] text-ink">Create your account</h2>
          <p className="mt-1 text-sm leading-[1.63] text-body">Free for students &amp; staff.</p>
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
            <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger">
              {error}
            </p>
          ) : null}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Creating…" : "Create account →"}
          </button>
        </form>
        <p className="text-sm text-body">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
