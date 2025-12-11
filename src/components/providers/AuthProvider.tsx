"use client";

import { useInitializeStores } from "@/zustand/useInitializeStores";
import { useFirebaseAuthSync } from "@/hooks/useFirebaseAuthSync";

/**
 * Provider component for authentication initialization.
 * Handles Firebase auth sync and store initialization.
 * Should wrap the app inside ClerkProvider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useInitializeStores();
  useFirebaseAuthSync();
  return <>{children}</>;
}
