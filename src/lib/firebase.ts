import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

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
const auth = getAuth(app);

// Set auth persistence to LOCAL (bleibt eingeloggt auch nach Browser-Neustart)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Auth persistence error:', error);
});

export { app, db, storage, auth };
