/**
 * Firebase configuration
 *
 * All values are read from Vite environment variables so that real
 * credentials are never committed to the repository.
 *
 * Required .env variables (prefix every key with VITE_ for Vite projects):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_MEASUREMENT_ID   (optional – only needed for Analytics)
 *
 * Copy .env.example to .env and fill in the values from your Firebase console:
 *   https://console.firebase.google.com → Project Settings → Your apps → SDK setup
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Prevent multiple initializations during HMR in development
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Enable offline persistence so users can browse cached data without internet.
// This call is safe to ignore if it fails (e.g., multiple tabs or SSR).
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open; only one can have persistence enabled.
    console.warn("[Firebase] Offline persistence disabled (multiple tabs).");
  } else if (err.code === "unimplemented") {
    // Browser doesn't support IndexedDB.
    console.warn("[Firebase] Offline persistence not supported in this browser.");
  }
});

export default app;
