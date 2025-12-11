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
import { useAuthStore } from "@/zustand/useAuthStore";
import { logger } from "@/lib/logger";

/**
 * Hook to synchronize Clerk authentication state with Firebase.
 * Signs in/out of Firebase when Clerk auth state changes.
 */
export function useFirebaseAuthSync() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  useEffect(() => {
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

          setAuthDetails({
            uid: user.id,
            firebaseUid: userCredentials.user.uid,
            authEmail: user.emailAddresses[0]?.emailAddress || "",
            authDisplayName: user.fullName || "",
            authPhotoUrl: user.imageUrl,
            authReady: true,
            lastSignIn: serverTimestamp() as Timestamp,
          });
        } catch (error) {
          logger.error("useFirebaseAuthSync", "Error signing in", error);
          clearAuthDetails();
        }
      } else {
        // User is not signed in with Clerk
        await firebaseSignOut(auth);
        clearAuthDetails();
      }
    };

    syncAuthState();
  }, [clearAuthDetails, getToken, isSignedIn, setAuthDetails, user]);
}
