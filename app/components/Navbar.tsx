"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listNotifications } from "@/lib/data";

const LINKS = [
  { href: "/", label: "Registry", icon: "❦" },
  { href: "/items/new", label: "File Entry", icon: "✒" },
  { href: "/dashboard", label: "My Entries", icon: "🗂" },
  { href: "/keywords", label: "Notifications", icon: "🔔" },
  { href: "/admin", label: "Security Office", icon: "🛡", adminOnly: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!user) {
      setUnread(0);
      return;
    }
    listNotifications(user.uid)
      .then((d) => setUnread(d.unread))
      .catch(() => setUnread(0));
  }, [pathname, user]);

  const visible = LINKS.filter((l) => !l.adminOnly || user?.role === "admin");

  return (
    <header className="sticky top-0 z-30 bg-navy-800 text-white shadow-lg">
      <div className="h-1 bg-linear-to-r from-gold-500 via-gold-300 to-gold-500" aria-hidden />
      <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-1 flex items-center gap-2.5" aria-label="Boomerang home">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-b from-gold-300 to-gold-500 font-display text-xl font-black text-navy-800">
            B
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight">Boomerang</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">
              Office of Lost &amp; Found
            </span>
          </span>
        </Link>

        <div className="ml-2 hidden items-center gap-1 lg:flex">
          {visible.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white/10 text-gold-300 underline decoration-gold-500 decoration-2 underline-offset-8"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
                {l.href === "/keywords" && unread > 0 && (
                  <span
                    className="absolute -right-1 -top-1 min-w-5 rounded-full bg-gold-500 px-1 text-center text-[11px] font-bold text-navy-800"
                    aria-label={`${unread} unread notifications`}
                  >
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <span className="flex-1" />

        {user ? (
          <div className="hidden items-center gap-3 lg:flex">
            <span className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-b from-gold-300 to-gold-500 font-display text-xs font-bold text-navy-800">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              {user.name}
              {user.role === "admin" ? (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-800">staff</span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.push("/");
              }}
              className="rounded-md border border-white/30 px-3 py-2 text-sm font-semibold hover:border-gold-300 hover:text-gold-300"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white">
              Sign in
            </Link>
            <Link href="/register" className="btn-gold !py-2 text-sm">
              Join the university
            </Link>
          </div>
        )}

        <button
          type="button"
          className="rounded-md border border-white/30 px-3 py-2 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open ? (
        <div className="space-y-1 border-t border-white/15 bg-navy-900 px-4 py-3 lg:hidden">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold ${
                pathname === l.href ? "bg-white/10 text-gold-300" : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <span aria-hidden>{l.icon}</span> {l.label}
              {l.href === "/keywords" && unread > 0 ? (
                <span className="ml-auto rounded-full bg-gold-500 px-2 text-xs font-bold text-navy-800">{unread}</span>
              ) : null}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  router.push("/");
                }}
                className="w-full rounded-md border border-white/30 px-3 py-2 text-sm font-semibold"
              >
                Sign out ({user.name})
              </button>
            ) : (
              <>
                <Link href="/login" className="flex-1 rounded-md border border-white/30 px-3 py-2 text-center text-sm font-semibold">
                  Sign in
                </Link>
                <Link href="/register" className="btn-gold flex-1 text-center text-sm">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
