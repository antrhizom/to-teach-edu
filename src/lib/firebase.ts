import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// ⚠️ WICHTIG: Ersetze diese Werte mit deiner Firebase-Konfiguration!
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
const database = getDatabase(app);
const storage = getStorage(app);

export { app, database, storage };
