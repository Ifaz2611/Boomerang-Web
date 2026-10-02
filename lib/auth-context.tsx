"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_USERS } from "./demo-data";
import { auth, db, isFirebaseConfigured } from "./firebase";
import { ensureUserProfile } from "./data";
import type { AppUser } from "./types";

const LS_SESSION = "boomerang_session_v2";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  demoMode: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  demoMode: !isFirebaseConfigured,
  signUp: async () => {},
  signIn: async () => {},
  signOutUser: async () => {},
});

function readSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(LS_SESSION);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(typeof window !== "undefined" ? readSession() : null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fb) => {
      if (!fb) {
        setUser(null);
        setLoading(false);
        return;
      }
      let role: AppUser["role"] = "user";
      let name = fb.displayName ?? fb.email?.split("@")[0] ?? "Member";
      try {
        if (db) {
          const snap = await getDoc(doc(db, "users", fb.uid));
          if (snap.exists()) {
            const data = snap.data() as { name?: string; role?: AppUser["role"] };
            if (data.name) name = data.name;
            if (data.role) role = data.role;
          }
        }
      } catch {
        /* offline — default role */
      }
      setUser({ uid: fb.uid, name, email: fb.email ?? "", role });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      if (DEMO_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase()) || readSession()?.email === email) {
        throw new Error("An account with this email already exists in demo mode.");
      }
      const next: AppUser = { uid: `demo-${Date.now()}`, name, email, role: "user" };
      localStorage.setItem(LS_SESSION, JSON.stringify(next));
      setUser(next);
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile: AppUser = { uid: cred.user.uid, name, email, role: "user" };
    await ensureUserProfile(profile);
    setUser(profile);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      const found = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      );
      if (found) {
        const next: AppUser = { uid: found.uid, name: found.name, email: found.email, role: found.role };
        localStorage.setItem(LS_SESSION, JSON.stringify(next));
        setUser(next);
        return;
      }
      const sess = readSession();
      if (sess && sess.email.toLowerCase() === email.toLowerCase()) {
        setUser(sess);
        return;
      }
      throw new Error("Invalid email or password. Try admin@campus.edu / Admin123! in demo mode.");
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let role: AppUser["role"] = "user";
    let name = cred.user.displayName ?? email.split("@")[0]!;
    if (db) {
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        const data = snap.data() as { name?: string; role?: AppUser["role"] };
        if (data.name) name = data.name;
        if (data.role) role = data.role;
      } else {
        await ensureUserProfile({ uid: cred.user.uid, name, email, role });
      }
    }
    setUser({ uid: cred.user.uid, name, email, role });
  }, []);

  const signOutUser = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(LS_SESSION);
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, demoMode: !isFirebaseConfigured, signUp, signIn, signOutUser }),
    [user, loading, signUp, signIn, signOutUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
