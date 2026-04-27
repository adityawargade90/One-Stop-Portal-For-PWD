/**
 * Firebase Authentication helpers
 *
 * Thin wrappers around Firebase Auth SDK calls.
 * Import these instead of calling the SDK directly so that all auth
 * logic is centralised and easy to swap/mock later.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth } from "./config";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthUser = User;

// ─── Register ────────────────────────────────────────────────────────────────

/**
 * Create a new user account with email + password.
 * Immediately sets the displayName on the new account.
 */
export async function registerWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );

  // Store displayName so it is available immediately via currentUser
  await updateProfile(credential.user, { displayName: fullName });

  // Send email verification
  await sendEmailVerification(credential.user);

  return credential;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

/**
 * Sign in an existing user with email + password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  return firebaseSignOut(firebaseAuth);
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(firebaseAuth, email);
}

// ─── Auth State Observer ──────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function — call it to stop listening.
 */
export function watchAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(firebaseAuth, callback);
}

// ─── Current User ─────────────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return firebaseAuth.currentUser;
}
