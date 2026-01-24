import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { User, Comment, PDFData, TaskRating } from '@/types';

// Collections
const USERS_COLLECTION = 'users';
const COMMENTS_COLLECTION = 'comments';
const PDFS_COLLECTION = 'pdfs';

// ==================== USER OPERATIONS ====================

export async function createUser(userId: string, userData: Omit<User, 'userId'>) {
  await setDoc(doc(db, USERS_COLLECTION, userId), {
    ...userData,
    createdAt: userData.createdAt || new Date().toISOString()
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (docSnap.exists()) {
    return { userId: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
}

export async function getAllUsers(): Promise<User[]> {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    userId: doc.id,
    ...doc.data()
  })) as User[];
}

export async function getUserByCode(code: string): Promise<User | null> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('code', '==', code.toUpperCase()),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { userId: doc.id, ...doc.data() } as User;
  }
  return null;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('username', '==', username),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function updateUserSubtasks(userId: string, subtasks: Record<string, string>) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    completedSubtasks: subtasks
  });
}

export async function updateUserRatings(userId: string, ratings: Record<number, TaskRating>) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ratings: ratings
  });
}

export async function deleteUser(userId: string) {
  await deleteDoc(doc(db, USERS_COLLECTION, userId));
}

export async function resetUserProgress(userId: string) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    completedSubtasks: {},
    ratings: {}
  });
}

// ==================== COMMENT OPERATIONS ====================

export async function createComment(commentData: Omit<Comment, 'id'>) {
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const newCommentRef = doc(commentsRef);
  await setDoc(newCommentRef, {
    ...commentData,
    timestamp: commentData.timestamp || new Date().toISOString()
  });
  return newCommentRef.id;
}

export async function getAllComments(): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
}

export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}

// ==================== PDF OPERATIONS ====================

export async function savePDFData(taskId: string, pdfData: PDFData) {
  await setDoc(doc(db, PDFS_COLLECTION, taskId), {
    ...pdfData,
    uploadedAt: new Date().toISOString()
  });
}

export async function getPDFData(taskId: string): Promise<PDFData | null> {
  const docSnap = await getDoc(doc(db, PDFS_COLLECTION, taskId));
  if (docSnap.exists()) {
    return docSnap.data() as PDFData;
  }
  return null;
}

export async function getAllPDFs(): Promise<Record<string, PDFData>> {
  const querySnapshot = await getDocs(collection(db, PDFS_COLLECTION));
  const pdfs: Record<string, PDFData> = {};
  querySnapshot.docs.forEach(doc => {
    pdfs[doc.id] = doc.data() as PDFData;
  });
  return pdfs;
}

export async function deletePDFData(taskId: string) {
  await deleteDoc(doc(db, PDFS_COLLECTION, taskId));
}

// ==================== STATISTICS ====================

export async function getUsersByGroup(group: string): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('group', '==', group)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    userId: doc.id,
    ...doc.data()
  })) as User[];
}

export async function getUsersCount(): Promise<number> {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  return querySnapshot.size;
}

// ==================== ADMIN OPERATIONS ====================

export async function deleteAllUsers() {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

export async function exportAllData() {
  const [users, comments] = await Promise.all([
    getAllUsers(),
    getAllComments()
  ]);
  
  return {
    users,
    comments,
    exportDate: new Date().toISOString()
  };
}
