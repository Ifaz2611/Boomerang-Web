import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** True when real Firebase credentials are present. Otherwise the app runs on local demo data. */
export const isFirebaseConfigured =
  Boolean(config.apiKey) && Boolean(config.projectId) && Boolean(config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0]! : initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  try {
    storage = config.storageBucket ? getStorage(app) : null;
  } catch {
    storage = null;
  }
  // Analytics is browser-only and optional — never let it break the app.
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    try {
      analytics = getAnalytics(app);
    } catch {
      analytics = null;
    }
  }
}

export { app, auth, db, storage, analytics };

/** Convert raw Firebase Auth errors into actionable human-readable messages. */
export function friendlyAuthError(err: unknown, fallback: string): string {
  const code =
    typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : "";
  switch (code) {
    case "auth/configuration-not-found":
      return (
        "Firebase Authentication is not enabled for this project. " +
        "In Firebase Console open Build > Authentication > Get started, enable the Email/Password sign-in provider, " +
        "then restart `npm run dev` and try again."
      );
    case "auth/operation-not-allowed":
      return (
        "Email/Password sign-in is disabled. Enable it under Firebase Console > Authentication > Sign-in method > Email/Password."
      );
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "auth/weak-password":
      return "Password is too weak — use at least 6 characters.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/network-request-failed":
      return "Network error reaching Firebase. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain (e.g. localhost) is not authorized. Add it under Authentication > Settings > Authorized domains.";
    default:
      return err instanceof Error ? `${fallback}: ${err.message}` : fallback;
  }
}
