"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase";
import { logger } from "@/lib/logger";

/**
 * Firebase user interface mapped to match Clerk's user structure.
 * This allows existing code using user.id to work without changes.
 */
export interface FirebaseUser {
  id: string; // Maps from user.uid
  fullName: string | null; // Maps from user.displayName
  imageUrl: string | null; // Maps from user.photoURL
  emailAddresses: Array<{ emailAddress: string }>; // Maps from user.email
  primaryEmailAddress: { emailAddress: string } | null;
}

/**
 * Auth state interface matching Clerk's useAuth() return type.
 */
export interface FirebaseAuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: FirebaseUser | null;
  firebaseUser: User | null; // Raw Firebase user for advanced use cases
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, displayName?: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLinkSignIn: (email: string) => Promise<void>;
}

// Google auth provider instance
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Email link settings
const actionCodeSettings = {
  url: typeof window !== "undefined" ? `${window.location.origin}/login` : "",
  handleCodeInApp: true,
};

/**
 * Adapts Firebase User to Clerk-compatible FirebaseUser interface.
 */
function adaptFirebaseUser(user: User | null): FirebaseUser | null {
  if (!user) return null;

  return {
    id: user.uid,
    fullName: user.displayName,
    imageUrl: user.photoURL,
    emailAddresses: user.email ? [{ emailAddress: user.email }] : [],
    primaryEmailAddress: user.email ? { emailAddress: user.email } : null,
  };
}

/**
 * Creates a session cookie by calling the session API.
 * Returns true if successful, false otherwise.
 */
async function createSessionCookie(user: User): Promise<boolean> {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ parseError: true }));
      logger.error("useFirebaseAuth", "Session API returned error", errorData);
      // Log more details for debugging
      console.error("[Session Cookie Error]", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("useFirebaseAuth", "Failed to create session cookie", error);
    return false;
  }
}

/**
 * Clears the session cookie by calling the session API.
 */
async function clearSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch (error) {
    logger.error("useFirebaseAuth", "Failed to clear session cookie", error);
  }
}

/**
 * Core Firebase Auth hook that provides authentication state and methods.
 * Designed to be a drop-in replacement for Clerk's useAuth() and useUser() hooks.
 */
export function useFirebaseAuth(): FirebaseAuthState {
  const [isLoaded, setIsLoaded] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Create session cookie for middleware auth BEFORE setting loaded state
      // This ensures the cookie exists before any redirects happen
      if (user) {
        await createSessionCookie(user);
      }

      setFirebaseUser(user);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Adapt Firebase user to Clerk-compatible format
  const user = useMemo(() => adaptFirebaseUser(firebaseUser), [firebaseUser]);

  // Get Firebase ID token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch (error) {
      logger.error("useFirebaseAuth", "Failed to get token", error);
      return null;
    }
  }, [firebaseUser]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await clearSessionCookie();
      await firebaseSignOut(auth);
    } catch (error) {
      logger.error("useFirebaseAuth", "Failed to sign out", error);
      throw error;
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createSessionCookie(result.user);
    } catch (error) {
      logger.error("useFirebaseAuth", "Google sign-in failed", error);
      throw error;
    }
  }, []);

  // Sign in with email and password
  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await createSessionCookie(result.user);
      } catch (error) {
        logger.error("useFirebaseAuth", "Email sign-in failed", error);
        throw error;
      }
    },
    []
  );

  // Create account with email and password
  const createAccount = useCallback(
    async (email: string, password: string, displayName?: string): Promise<void> => {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name if provided
        if (displayName) {
          await updateProfile(result.user, { displayName });
        }

        await createSessionCookie(result.user);
      } catch (error) {
        logger.error("useFirebaseAuth", "Account creation failed", error);
        throw error;
      }
    },
    []
  );

  // Send magic link email
  const sendMagicLink = useCallback(async (email: string): Promise<void> => {
    try {
      // Store email for completing sign-in
      if (typeof window !== "undefined") {
        localStorage.setItem("emailForSignIn", email);
      }

      await sendSignInLinkToEmail(auth, email, {
        ...actionCodeSettings,
        url: `${window.location.origin}/login`,
      });
    } catch (error) {
      logger.error("useFirebaseAuth", "Failed to send magic link", error);
      throw error;
    }
  }, []);

  // Complete magic link sign-in
  const completeMagicLinkSignIn = useCallback(async (email: string): Promise<void> => {
    try {
      if (typeof window === "undefined") return;

      if (isSignInWithEmailLink(auth, window.location.href)) {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        await createSessionCookie(result.user);

        // Clean up stored email
        localStorage.removeItem("emailForSignIn");
      }
    } catch (error) {
      logger.error("useFirebaseAuth", "Magic link sign-in failed", error);
      throw error;
    }
  }, []);

  return {
    isLoaded,
    isSignedIn: !!firebaseUser,
    user,
    firebaseUser,
    getToken,
    signOut,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    sendMagicLink,
    completeMagicLinkSignIn,
  };
}

/**
 * Check if the current URL is a magic link sign-in URL.
 * Useful for detecting magic link callbacks.
 */
export function isMagicLinkCallback(): boolean {
  if (typeof window === "undefined") return false;
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Get stored email for magic link sign-in.
 */
export function getStoredEmailForSignIn(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("emailForSignIn");
}
