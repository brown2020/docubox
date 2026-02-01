"use client";

import { ReactNode } from "react";
import { useAuth } from "./FirebaseAuthProvider";

interface SignedOutProps {
  children: ReactNode;
}

/**
 * Renders children only when the user is signed out.
 * Matches Clerk's SignedOut component behavior.
 */
export function SignedOut({ children }: SignedOutProps) {
  const { isLoaded, isSignedIn } = useAuth();

  // Don't render anything while loading
  if (!isLoaded) {
    return null;
  }

  // Only render children if signed out
  if (isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
