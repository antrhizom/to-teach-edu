import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateCode } from './constants';
import { User } from '@/types';

// ==================== HELPER FUNCTIONS ====================

/**
 * Generiert eine virtuelle Email für Teilnehmer
 */
function generateVirtualEmail(username: string, timestamp: number): string {
  const cleanUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  
  return `${cleanUsername}.${timestamp}@weiterbildung.local`;
}

/**
 * Generiert ein sicheres temporäres Passwort
 */
function generateSecurePassword(): string {
  return generateCode() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Prüft ob User Admin ist (via Custom Claims)
 */
export async function isAdmin(user: FirebaseUser): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.admin === true;
}

// ==================== PARTICIPANT AUTHENTICATION ====================

/**
 * Registriert einen neuen Teilnehmer
 * Erstellt virtuellen Auth-User im Hintergrund
 */
export async function registerParticipant(
  username: string, 
  group: string
): Promise<{ code: string; email: string; uid: string }> {
  try {
    // 1. Generiere Code (wird als Passwort genutzt)
    const code = generateCode();
    
    // 2. Generiere virtuelle Email
    const timestamp = Date.now();
    const virtualEmail = generateVirtualEmail(username, timestamp);
    
    // 3. Erstelle Auth-User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      virtualEmail,
      code
    );
    
    const uid = userCredential.user.uid;
    
    // 4. Erstelle Firestore User-Dokument
    await setDoc(doc(db, 'users', uid), {
      username: username.trim(),
      group: group,
      code: code,
      email: virtualEmail,
      createdAt: new Date().toISOString(),
      completedSubtasks: {},
      ratings: {},
      isVirtual: true // Flag für virtuelle User
    });
    
    return {
      code,
      email: virtualEmail,
      uid
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Bessere Error-Messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Dieser Name ist bereits vergeben');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Passwort zu schwach (sollte nicht passieren)');
    } else {
      throw new Error('Fehler bei der Registrierung: ' + error.message);
    }
  }
}

/**
 * Login für Teilnehmer mit Code
 * Sucht virtuelle Email und loggt ein
 */
export async function loginParticipantWithCode(code: string): Promise<User> {
  try {
    // Import Firestore functions
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // 1. Finde User mit diesem Code in Firestore
    const q = query(
      collection(db, 'users'), 
      where('code', '==', code.toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Code nicht gefunden');
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // 2. Login mit virtueller Email + Code
    await signInWithEmailAndPassword(auth, userData.email, code.toUpperCase());
    
    return {
      ...userData,
      userId: userDoc.id
    } as User;
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Code nicht gefunden oder ungültig');
    } else if (error.message === 'Code nicht gefunden') {
      throw error;
    } else {
      throw new Error('Fehler beim Anmelden: ' + error.message);
    }
  }
}

// ==================== ADMIN AUTHENTICATION ====================

/**
 * Login für Admin mit Email/Passwort
 */
export async function loginAdmin(
  email: string, 
  password: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Prüfe ob User Admin ist
    const adminStatus = await isAdmin(user);
    
    if (!adminStatus) {
      await signOut(auth);
      throw new Error('Keine Admin-Berechtigung');
    }
    
    return user;
  } catch (error: any) {
    console.error('Admin login error:', error);
    
    if (error.message === 'Keine Admin-Berechtigung') {
      throw error;
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Email oder Passwort falsch');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige Email-Adresse');
    } else {
      throw new Error('Fehler beim Admin-Login: ' + error.message);
    }
  }
}

// ==================== GENERAL AUTHENTICATION ====================

/**
 * Logout für alle User-Typen
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Aktuellen User holen
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Auth State Observer
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Holt User-Daten aus Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, 'users', uid));
  
  if (docSnap.exists()) {
    return {
      userId: docSnap.id,
      ...docSnap.data()
    } as User;
  }
  
  return null;
}

/**
 * Prüft ob aktueller User Admin ist
 */
export async function checkIsAdmin(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) return false;
  return isAdmin(user);
}
