/**
 * Firestore database helpers
 *
 * All Firestore reads and writes go through this module so that the
 * rest of the app stays decoupled from the Firebase SDK.
 *
 * Collection layout
 * ─────────────────
 *  users/{uid}          → UserProfile document
 *  feedback/{id}        → Anonymous feedback documents
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
  type FieldValue,
} from "firebase/firestore";
import { db } from "./config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  disabilityType: string;
  disabilityPercentage: number;
  educationLevel: string;
  employmentStatus: string;
  state: string;
  district: string;
  profileCompleted: boolean;
  /** Set by Firestore serverTimestamp() on document creation */
  createdAt?: Timestamp | FieldValue;
  /** Set by Firestore serverTimestamp() on every update */
  updatedAt?: Timestamp | FieldValue;
}

export interface FeedbackEntry {
  message: string;
  rating: number;
  userId?: string;
  /** Set by Firestore serverTimestamp() on document creation */
  createdAt?: Timestamp | FieldValue;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Create or overwrite a user profile document.
 * Typically called right after registration.
 */
export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    ...data,
    uid,
    profileCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Fetch a user profile document by UID.
 * Returns null if the document does not exist.
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/**
 * Partially update an existing user profile.
 * Automatically marks profileCompleted = true when all required fields
 * are present.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", uid);

  // Merge with existing data to determine completion status
  const snap = await getDoc(ref);
  const existing: DocumentData = snap.exists() ? snap.data() : {};
  const merged = { ...existing, ...data };

  const profileCompleted = !!(
    merged.disabilityType &&
    merged.educationLevel &&
    merged.state
  );

  await updateDoc(ref, {
    ...data,
    profileCompleted,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a user profile document.
 * Call this when permanently removing an account.
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

/**
 * Save a feedback entry to Firestore.
 */
export async function saveFeedback(entry: FeedbackEntry): Promise<string> {
  const ref = collection(db, "feedback");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
