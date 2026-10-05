import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Automatically sign in anonymously to ensure every guest/partner has a valid auth session
let authPromise: Promise<any> | null = null;
export function ensureAuth() {
  if (!authPromise) {
    authPromise = signInAnonymously(auth).catch((err) => {
      console.warn("Anonymous auth notice (rules allow open read/write):", err?.message);
    });
  }
  return authPromise;
}

// Ensure auth is kicked off on module load
ensureAuth();

// Test connection to Firestore as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
