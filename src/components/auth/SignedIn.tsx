"use client";

import { ReactNode } from "react";
import { useAuth } from "./FirebaseAuthProvider";

interface SignedInProps {
  children: ReactNode;
}

/**
 * Renders children only when the user is signed in.
 * Matches Clerk's SignedIn component behavior.
 */
export function SignedIn({ children }: SignedInProps) {
  const { isLoaded, isSignedIn } = useAuth();

  // Don't render anything while loading
  if (!isLoaded) {
    return null;
  }

  // Only render children if signed in
  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
