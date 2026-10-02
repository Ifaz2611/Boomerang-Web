"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listNotifications } from "@/lib/data";

const LINKS = [
  { href: "/", label: "Browse", icon: "🧭" },
  { href: "/items/new", label: "Report", icon: "＋" },
  { href: "/dashboard", label: "My posts", icon: "🗂" },
  { href: "/keywords", label: "Alerts", icon: "🔔" },
  { href: "/admin", label: "Security", icon: "🛡", adminOnly: true },
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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-1 flex items-center gap-2.5" aria-label="Boomerang home">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 text-lg font-black text-white shadow-lg shadow-indigo-600/30">
            B
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight">Boomerang</span>
            <span className="block text-[11px] font-medium text-slate-500">Campus lost &amp; found</span>
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
                className={`relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {l.label}
                {l.href === "/keywords" && unread > 0 && (
                  <span
                    className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[11px] font-bold text-white"
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
            <span className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-xs font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              {user.name}
              {user.role === "admin" ? (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">staff</span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.push("/");
              }}
              className="btn-ghost !py-2 text-sm"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Log in
            </Link>
            <Link href="/register" className="btn-primary !py-2 text-sm">
              Join campus
            </Link>
          </div>
        )}

        <button
          type="button"
          className="btn-ghost !px-3 !py-2 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open ? (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                pathname === l.href ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden>{l.icon}</span> {l.label}
              {l.href === "/keywords" && unread > 0 ? (
                <span className="ml-auto rounded-full bg-rose-500 px-2 text-xs font-bold text-white">{unread}</span>
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
                className="btn-ghost flex-1 text-sm"
              >
                Log out ({user.name})
              </button>
            ) : (
              <>
                <Link href="/login" className="btn-ghost flex-1 text-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary flex-1 text-sm">
                  Join campus
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
