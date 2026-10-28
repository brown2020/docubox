"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  onIdTokenChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
import { formatFirebaseAuthErrorForLog } from "@/lib/firebaseAuthErrors";
import { createSessionCookie, clearSessionCookie } from "@/lib/session-client";

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
  /** True only after the server has accepted the session cookie. */
  sessionReady: boolean;
  /** Set when Firebase Auth succeeded but the server session did not. */
  sessionError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLinkSignIn: (email: string) => Promise<void>;
}

// Google auth provider instance
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});


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
 * Core Firebase Auth hook that provides authentication state and methods.
 * Designed to be a drop-in replacement for Clerk's useAuth() and useUser() hooks.
 */
export function useFirebaseAuth(): FirebaseAuthState {
  const [isLoaded, setIsLoaded] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const establishSession = useCallback(async (user: User) => {
    try {
      await createSessionCookie(user);
      setSessionError(null);
      setSessionReady(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create session";
      setSessionReady(false);
      setSessionError(message);
      logger.error(
        "useFirebaseAuth",
        "Failed to create session cookie",
        formatFirebaseAuthErrorForLog(error)
      );
      throw error;
    }
  }, []);

  // Refresh the server cookie whenever Firebase rotates the ID token.
  // Do not navigate until establishSession resolves; a client-only sign-in
  // bounces between /dashboard and /login.
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoaded(true);
      if (user) {
        void establishSession(user).catch(() => {
          // sessionError is already set for the login page.
        });
        return;
      }
      setSessionReady(false);
      setSessionError(null);
      void clearSessionCookie();
    });

    return () => unsubscribe();
  }, [establishSession]);

  // Adapt Firebase user to Clerk-compatible format
  const user = useMemo(() => adaptFirebaseUser(firebaseUser), [firebaseUser]);

  // Get Firebase ID token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch (error) {
      logger.error(
        "useFirebaseAuth",
        "Failed to get token",
        formatFirebaseAuthErrorForLog(error)
      );
      return null;
    }
  }, [firebaseUser]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // 1. Delete server session cookie BEFORE Firebase sign-out.
      await clearSessionCookie();

      // 2. Sign out of Firebase.
      await firebaseSignOut(auth);

      // 3. Clear browser storage to prevent stale data leaking to next user.
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    } catch (error) {
      logger.error(
        "useFirebaseAuth",
        "Failed to sign out",
        formatFirebaseAuthErrorForLog(error)
      );
      // Best-effort cleanup even on error
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      throw error;
    }
  }, []);

  // Sign in with Google — errors propagate to LoginForm (map + UI; do not rethrow there).
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const result = await signInWithPopup(auth, googleProvider);
    await establishSession(result.user);
  }, [establishSession]);

  // Sign in with email and password — errors propagate to LoginForm.
  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await establishSession(result.user);
    },
    [establishSession]
  );

  // Create account with email and password — errors propagate to LoginForm.
  const createAccount = useCallback(
    async (email: string, password: string, displayName?: string): Promise<void> => {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      await establishSession(result.user);
    },
    [establishSession]
  );

  // Send password reset email — errors propagate to LoginForm.
  const sendPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  }, []);

  // Send magic link email — errors propagate to LoginForm.
  const sendMagicLink = useCallback(async (email: string): Promise<void> => {
    // Store email for completing sign-in
    if (typeof window !== "undefined") {
      localStorage.setItem("emailForSignIn", email);
    }

    await sendSignInLinkToEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    });
  }, []);

  // Complete magic link sign-in — errors propagate to LoginForm.
  const completeMagicLinkSignIn = useCallback(async (email: string): Promise<void> => {
    if (typeof window === "undefined") return;

    if (isSignInWithEmailLink(auth, window.location.href)) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      await establishSession(result.user);

      // Clean up stored email
      localStorage.removeItem("emailForSignIn");
    }
  }, [establishSession]);

  return {
    isLoaded,
    isSignedIn: !!firebaseUser,
    user,
    firebaseUser,
    getToken,
    signOut,
    sessionReady,
    sessionError,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    sendPasswordReset,
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
