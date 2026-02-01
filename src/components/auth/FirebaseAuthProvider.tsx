"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useFirebaseAuth,
  FirebaseAuthState,
  FirebaseUser,
} from "@/hooks/useFirebaseAuth";

/**
 * Auth context for Firebase authentication.
 * Provides the same interface as Clerk's useAuth() and useUser().
 */
const AuthContext = createContext<FirebaseAuthState | null>(null);

/**
 * Props for FirebaseAuthProvider.
 */
interface FirebaseAuthProviderProps {
  children: ReactNode;
}

/**
 * Firebase Auth Provider - replaces ClerkProvider.
 * Provides authentication context to the entire app.
 */
export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const auth = useFirebaseAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state - matches Clerk's useAuth() interface.
 * Returns: isLoaded, isSignedIn, getToken, signOut
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a FirebaseAuthProvider");
  }

  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    userId: context.user?.id ?? null,
    getToken: context.getToken,
    signOut: context.signOut,
  };
}

/**
 * Hook to access user data - matches Clerk's useUser() interface.
 * Returns: isLoaded, isSignedIn, user
 */
export function useUser(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: FirebaseUser | null;
} {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within a FirebaseAuthProvider");
  }

  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    user: context.user,
  };
}

/**
 * Hook to access all auth methods (sign in, sign out, etc.).
 * Use this for login pages or components that need auth actions.
 */
export function useAuthMethods() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthMethods must be used within a FirebaseAuthProvider");
  }

  return {
    signInWithGoogle: context.signInWithGoogle,
    signInWithEmail: context.signInWithEmail,
    createAccount: context.createAccount,
    sendMagicLink: context.sendMagicLink,
    completeMagicLinkSignIn: context.completeMagicLinkSignIn,
    signOut: context.signOut,
  };
}
