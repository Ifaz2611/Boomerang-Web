import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/lib/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";

export const metadata: Metadata = {
  title: "Boomerang — Campus Lost & Found",
  description: "Report lost & found items, search with filters, verify claims, and get keyword alerts. Powered by Firebase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-lg focus:bg-indigo-600 focus:p-2 focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>
          <Navbar />
          {!isFirebaseConfigured ? (
            <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
              Demo mode — add your Firebase keys to <code>.env.local</code> to go live. Data is stored locally until then.
            </p>
          ) : null}
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white/70 py-6">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="flex items-center gap-2 text-sm font-bold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white">
                  B
                </span>
                Boomerang
              </p>
              <p className="text-xs text-slate-500">
                Campus lost &amp; found · Firebase Auth + Firestore · owner details stay private until a claim is accepted
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
