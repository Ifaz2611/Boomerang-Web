"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { friendlyAuthError } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, demoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(friendlyAuthError(err, "Login failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
      <div className="hero-band relative hidden overflow-hidden rounded-2xl border border-hairline p-8 lg:block">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative flex h-full flex-col">
          <p className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-sm font-bold uppercase tracking-[0.3px] text-white shadow-[rgba(124,59,237,0.2)_0px_10px_15px_-3px,rgba(124,59,237,0.2)_0px_4px_6px_-4px]" aria-hidden>
            Portal
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-[1.2] tracking-[-0.75px] text-ink">Welcome back</h1>
          <p className="mt-2 text-sm leading-[1.63] text-body">
            Pick up where you left off — check your claims, review matches for your alerts, and help items find their
            owners.
          </p>
          <ul className="mt-6 space-y-2 text-sm font-medium text-ink">
            <li className="card !rounded-xl p-3">Keyword alerts ping you on new matches</li>
            <li className="card !rounded-xl p-3">Claims are verified before handover</li>
            <li className="card !rounded-xl p-3">Owner details stay private by default</li>
          </ul>
        </div>
      </div>

      <div className="card space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.75px] text-ink">Log in</h2>
          <p className="mt-1 text-sm leading-[1.63] text-body">
            {demoMode ? "Demo mode — no Firebase needed yet." : "Secured with Firebase Authentication."}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
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
              placeholder="you@iub.edu.bd"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="pw" className="label">
              Password
            </label>
            <input
              id="pw"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        {demoMode ? (
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            <p className="font-bold text-slate-700">Demo accounts</p>
            <p>
              <code>admin@campus.edu / Admin123!</code> (staff)
            </p>
            <p>
              <code>maya@campus.edu / Password123!</code> · <code>sam@campus.edu / Password123!</code>
            </p>
          </div>
        ) : null}
        <p className="text-sm text-body">
          No account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
