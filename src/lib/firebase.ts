import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Helper to check if firebase config file exists dynamically or fallback
let dbInstance: ReturnType<typeof getFirestore> | null = null;

export async function getFirestoreDb() {
  if (dbInstance) return dbInstance;

  try {
    // Safely check if firebase-applet-config.json exists using Vite import.meta.glob
    const configs = import.meta.glob('/firebase-applet-config.json', { eager: true });
    const configPath = Object.keys(configs)[0];

    if (!configPath) {
      console.warn("Firebase configuration file not found yet or not provisioned.");
      return null;
    }

    const configModule: any = configs[configPath];
    const firebaseConfig = configModule.default || configModule;

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    if (firebaseConfig.firestoreDatabaseId) {
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      dbInstance = getFirestore(app);
    }
    return dbInstance;
  } catch (err) {
    console.warn("Error initializing Firestore:", err);
    return null;
  }
}

export interface PactoResponsePayload {
  contactName: string;
  companyName: string;
  contactRole?: string;
  contactEmail?: string;
  territory: string;
  coins: Record<string, number>;
  synergies?: Record<string, unknown>;
  createdAt?: unknown;
}

export async function submitPactoResponse(payload: PactoResponsePayload): Promise<string> {
  const db = await getFirestoreDb();
  
  if (db) {
    const docRef = await addDoc(collection(db, "pacto_respuestas"), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } else {
    // Fallback: Store in localStorage for dev preview if firebase is pending
    const localHistory = JSON.parse(localStorage.getItem("pacto_respuestas") || "[]");
    const mockId = "local_" + Date.now();
    localHistory.push({ ...payload, id: mockId, createdAt: new Date().toISOString() });
    localStorage.setItem("pacto_respuestas", JSON.stringify(localHistory));
    return mockId;
  }
}
