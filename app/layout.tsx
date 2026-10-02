import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/lib/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";

export const metadata: Metadata = {
  title: "Boomerang — Campus Lost & Found Registry",
  description: "The university registry of lost and found articles. File entries, claim with proof, and arrange verified returns. Powered by Firebase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-lg focus:bg-navy-800 focus:p-2 focus:text-white"
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
          <footer className="bg-navy-800 py-6 text-white">
            <div className="h-px bg-linear-to-r from-transparent via-gold-500 to-transparent" aria-hidden />
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 pt-5 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="flex items-center gap-2 font-display text-sm font-bold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-linear-to-b from-gold-300 to-gold-500 text-navy-800">
                  B
                </span>
                Boomerang · Office of Lost &amp; Found
              </p>
              <p className="text-xs text-slate-300">
                The Campus Lost &amp; Found Registry · owner particulars remain private until a claim is accepted
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
