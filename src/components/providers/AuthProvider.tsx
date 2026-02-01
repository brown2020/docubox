"use client";

import { useAuth } from "@/components/auth";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import { useFirebaseAuthSync } from "@/hooks/useFirebaseAuthSync";
import { LoadingState } from "@/components/common/LoadingState";

/**
 * Provider component for authentication initialization.
 * Handles auth sync and store initialization.
 * Should wrap the app inside FirebaseAuthProvider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();

  useInitializeStores();
  useFirebaseAuthSync();

  // Show loading state while Firebase Auth initializes
  // This prevents components from rendering before auth state is known
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingState message="Loading..." size={40} />
      </div>
    );
  }

  return <>{children}</>;
}
