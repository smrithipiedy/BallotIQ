/**
 * Firebase client initialization.
 * Singleton pattern ensures only one Firebase app instance.
 * Initializes Auth (anonymous), Firestore, and Analytics.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

/** Firebase configuration from environment variables */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
};

/** Singleton Firebase app instance */
let firebaseApp: FirebaseApp | null = null;

/** Singleton Firestore instance */
let firestoreInstance: Firestore | null = null;

/** Singleton Auth instance */
let authInstance: Auth | null = null;

/** Singleton Analytics instance */
let analyticsInstance: Analytics | null = null;

/**
 * Returns the Firebase app singleton, initializing if needed.
 * @returns Firebase app instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}

/**
 * Returns the Firestore singleton instance.
 * @returns Firestore database instance
 */
export function getFirestoreDB(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  firestoreInstance = getFirestore(getFirebaseApp());
  return firestoreInstance;
}

/**
 * Returns the Auth singleton instance.
 * @returns Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

/**
 * Returns the Analytics singleton instance.
 * Note: Only works on client side.
 * @returns Analytics instance or null
 */
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;
  try {
    analyticsInstance = getAnalytics(getFirebaseApp());
    return analyticsInstance;
  } catch (error) {
    console.error('[Firebase] Analytics initialization failed:', error);
    return null;
  }
}

/**
 * Exported analytics instance for easy access.
 * Will be null on server or if initialization fails.
 */
export const analytics = typeof window !== 'undefined' ? getFirebaseAnalytics() : null;

/**
 * Promise that resolves when anonymous authentication is ready.
 */
export const authReady = new Promise<void>((resolve) => {
  if (typeof window === 'undefined') {
    resolve();
    return;
  }

  // 5-second timeout to prevent infinite hang
  const timeout = setTimeout(() => {
    console.warn('[Firebase] authReady timed out. Continuing with limited access.');
    resolve();
  }, 5000);

  const auth = getFirebaseAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      clearTimeout(timeout);
      resolve();
      unsubscribe();
    } else {
      signInAnonymously(auth).catch((err) => {
        console.error('[Firebase] Auto-auth failed:', err);
        clearTimeout(timeout);
        resolve(); // Resolve anyway to avoid blocking forever
      });
    }
  });
});

/**
 * Signs in the user anonymously if not already authenticated.
 * Anonymous auth is required for all Firestore writes.
 * @returns The authenticated User object
 */
export async function ensureAnonymousAuth(): Promise<User | null> {
  const auth = getFirebaseAuth();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error) {
    console.error('[Firebase] Anonymous auth failed:', error);
    return null;
  }
}

/**
 * Listens for auth state changes.
 * @param callback - Function called with current user on auth change
 * @returns Unsubscribe function
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Exported Firebase App instance for legacy or direct access.
 */
export const app = getFirebaseApp();
