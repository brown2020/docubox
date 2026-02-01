"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { auth } from "@/firebase";
import { useAuthStore, syncAuthToFirestore } from "@/zustand/useAuthStore";
import { logger } from "@/lib/logger";

/**
 * Hook to synchronize Clerk authentication state with Firebase.
 * Signs in/out of Firebase when Clerk auth state changes.
 */
export function useFirebaseAuthSync() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  useEffect(() => {
    // Wait for Clerk to load before attempting any auth operations
    if (!isLoaded) return;

    const syncAuthState = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken({ template: "integration_firebase" });
          const userCredentials = await signInWithCustomToken(
            auth,
            token || ""
          );

          // Update Firebase user profile
          await updateProfile(userCredentials.user, {
            displayName: user.fullName,
            photoURL: user.imageUrl,
          });

          const authDetails = {
            uid: user.id,
            firebaseUid: userCredentials.user.uid,
            authEmail: user.emailAddresses[0]?.emailAddress || "",
            authDisplayName: user.fullName || "",
            authPhotoUrl: user.imageUrl,
            authReady: true,
            lastSignIn: serverTimestamp() as Timestamp,
          };

          // Update local Zustand state
          setAuthDetails(authDetails);

          // Persist auth state to Firestore (non-blocking)
          syncAuthToFirestore(authDetails, user.id).catch((error) => {
            logger.error("useFirebaseAuthSync", "Failed to sync to Firestore", error);
          });
        } catch (error) {
          logger.error("useFirebaseAuthSync", "Error signing in", error);
          clearAuthDetails();
        }
      } else {
        // User is not signed in with Clerk - safely sign out of Firebase
        try {
          // Only sign out if there's a current Firebase user
          if (auth.currentUser) {
            await firebaseSignOut(auth);
          }
        } catch (error) {
          // Silently handle sign out errors (e.g., no user to sign out)
          logger.debug("useFirebaseAuthSync", {
            message: "Sign out skipped",
            error,
          });
        }
        clearAuthDetails();
      }
    };

    syncAuthState();
  }, [clearAuthDetails, getToken, isSignedIn, isLoaded, setAuthDetails, user]);
}
