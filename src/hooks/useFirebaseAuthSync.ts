"use client";

import { useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuthStore, syncAuthToFirestore } from "@/zustand/useAuthStore";
import { useUser } from "@/components/auth";
import { logger } from "@/lib/logger";

/**
 * Hook to synchronize Firebase authentication state with Zustand and Firestore.
 * Listens to Firebase auth changes and updates app state accordingly.
 *
 * Note: With pure Firebase auth, we no longer need custom token exchange.
 * The useFirebaseAuth hook handles the actual Firebase auth state.
 * This hook just syncs that state to Zustand and Firestore for the rest of the app.
 */
export function useFirebaseAuthSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  useEffect(() => {
    // Wait for auth to load before attempting any sync operations
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const authDetails = {
        uid: user.id,
        firebaseUid: user.id, // With pure Firebase, uid and firebaseUid are the same
        authEmail: user.primaryEmailAddress?.emailAddress || "",
        authDisplayName: user.fullName || "",
        authPhotoUrl: user.imageUrl || "",
        authReady: true,
        lastSignIn: Timestamp.now(),
      };

      // Update local Zustand state
      setAuthDetails(authDetails);

      // Persist auth state to Firestore (non-blocking)
      syncAuthToFirestore(authDetails, user.id).catch((error) => {
        logger.error("useFirebaseAuthSync", "Failed to sync to Firestore", error);
      });
    } else {
      // User is signed out - clear auth details
      clearAuthDetails();
    }
  }, [clearAuthDetails, isLoaded, isSignedIn, setAuthDetails, user]);
}
