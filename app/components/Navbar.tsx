"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listNotifications } from "@/lib/data";

const LINKS = [
  { href: "/", label: "Registry" },
  { href: "/items/new", label: "File Entry" },
  { href: "/dashboard", label: "My Entries" },
  { href: "/keywords", label: "Notifications" },
  { href: "/admin", label: "Security Office", adminOnly: true },
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
    <header className="sticky top-0 z-[100] border border-[rgba(220,220,229,0.5)] bg-[rgba(255,255,255,0.9)] backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex h-[66px] max-w-[1400px] items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="mr-1 flex items-center gap-2.5" aria-label="Boomerang home">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-[rgba(124,59,237,0.2)_0px_10px_15px_-3px,rgba(124,59,237,0.2)_0px_4px_6px_-4px]">
            B
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-[-0.45px] text-ink">Boomerang</span>
            <span className="block text-[12px] font-semibold uppercase tracking-[0.3px] text-body">
              Lost &amp; Found
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
                className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-[rgba(124,59,237,0.15)] text-primary" : "text-ink hover:bg-[rgba(124,59,237,0.1)] hover:text-primary"
                }`}
              >
                {l.label}
                {l.href === "/keywords" && unread > 0 && (
                  <span
                    className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[11px] font-bold text-white"
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
            <span className="flex items-center gap-2 rounded-full border border-hairline bg-white py-1 pl-1 pr-3 text-sm font-semibold text-ink">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              {user.name}
              {user.role === "admin" ? (
                <span className="rounded-full bg-[rgba(0,193,214,0.2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] text-cyan-accent">
                  Staff
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.push("/");
              }}
              className="btn-ghost"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-ink hover:bg-[rgba(124,59,237,0.1)] hover:text-primary">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary !h-10 !px-6 !text-sm">
              Join
            </Link>
          </div>
        )}

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white text-sm font-semibold text-ink lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open ? (
        <div className="space-y-1 border-t border-hairline bg-white/95 px-4 py-3 lg:hidden">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                pathname === l.href ? "bg-[rgba(124,59,237,0.15)] text-primary" : "text-ink hover:bg-[rgba(124,59,237,0.1)]"
              }`}
            >
              {l.label}
              {l.href === "/keywords" && unread > 0 ? (
                <span className="ml-auto rounded-full bg-primary px-2 text-xs font-bold text-white">{unread}</span>
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
                className="btn-ghost w-full"
              >
                Sign out ({user.name})
              </button>
            ) : (
              <>
                <Link href="/login" className="btn-ghost flex-1 text-center">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary flex-1 !h-10 text-center !text-sm">
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
