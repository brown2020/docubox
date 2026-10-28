"use client";

import { useInitializeStores } from "@/zustand/useInitializeStores";
import { useFirebaseAuthSync } from "@/hooks/useFirebaseAuthSync";

/**
 * Syncs auth into client stores without blocking the document.
 * Protected routes are enforced by the proxy. Public pages must render
 * their content in the initial HTML.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useInitializeStores();
  useFirebaseAuthSync();
  return <>{children}</>;
}
