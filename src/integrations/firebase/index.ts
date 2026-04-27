/**
 * Barrel export for all Firebase integrations.
 *
 * Usage:
 *   import { firebaseAuth, db }         from "@/integrations/firebase";
 *   import { signInWithEmail, signOut } from "@/integrations/firebase";
 *   import { getUserProfile }           from "@/integrations/firebase";
 */

export { default as firebaseApp, firebaseAuth, db } from "./config";

export {
  registerWithEmail,
  signInWithEmail,
  signOut,
  resetPassword,
  watchAuthState,
  getCurrentUser,
  type AuthUser,
} from "./auth";

export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  saveFeedback,
  type UserProfile,
  type FeedbackEntry,
} from "./firestore";
