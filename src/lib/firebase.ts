import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyACZvcT_03XaWKP0qKrZFZoIKILx5-lZps",
  authDomain: "toteach-edu.firebaseapp.com",
  projectId: "toteach-edu",
  storageBucket: "toteach-edu.firebasestorage.app",
  messagingSenderId: "551338168510",
  appId: "1:551338168510:web:6007104d08bf00959d4eef"
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
