"use client";

import { UserButton, SignInButton } from "@clerk/nextjs";
import { useIsMounted } from "@/hooks/useIsMounted";

/**
 * Client-safe wrapper for Clerk's UserButton.
 * Prevents hydration mismatches by showing a skeleton until mounted.
 */
export function SafeUserButton() {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />;
  }

  return <UserButton />;
}

/**
 * Client-safe wrapper for Clerk's SignInButton.
 * Prevents hydration mismatches by showing a skeleton until mounted.
 */
export function SafeSignInButton({ mode }: { mode: "modal" | "redirect" }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return <div className="w-20 h-8 rounded-md bg-gray-300 animate-pulse" />;
  }

  return <SignInButton mode={mode} />;
}
