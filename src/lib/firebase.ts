import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyACZvcT_03XaWKP0qKrZFZoIKILx5-lZps",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "toteach-edu.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "toteach-edu",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "toteach-edu.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "551338168510",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:551338168510:web:6007104d08bf00959d4eef",
};

// Initialize Firebase (nur wenn noch nicht initialisiert)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

// Auth mit korrekter Persistenz initialisieren
// SSR: inMemory (kein localStorage verfügbar)
// Browser: browserLocalPersistence (bleibt nach Browser-Neustart erhalten)
const auth = getAuth(app);

export const authReady: Promise<void> = typeof window !== 'undefined'
  ? setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Auth persistence error:', error);
    })
  : setPersistence(auth, inMemoryPersistence).catch(() => {});

export { app, db, storage, auth };
