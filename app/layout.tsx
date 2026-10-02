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
          className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-xl focus:bg-primary focus:p-2 focus:text-white"
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
          <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-14 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-hairline bg-white/80 py-8 backdrop-blur">
            <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-[rgba(124,59,237,0.2)_0px_10px_15px_-3px,rgba(124,59,237,0.2)_0px_4px_6px_-4px]">
                  B
                </span>
                Boomerang · Lost &amp; Found Portal
              </p>
              <p className="max-w-md text-xs leading-relaxed text-body">
                A community recovery network · owner details stay private until a claim is accepted
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
