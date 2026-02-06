"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useProfileStore from "@/zustand/useProfileStore";
import { useUser } from "@/components/auth";
import { LoadingState } from "@/components/common/LoadingState";
import { logger } from "@/lib/logger";

export default function LoginFinishPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    setAuthDetails({
      uid: user?.id,
      authEmail: user?.primaryEmailAddress?.emailAddress,
      authDisplayName: user?.fullName || "",
    });

    // Fetch (or create) the profile first, then redirect.
    // Using fetchProfile instead of updateProfile avoids Firestore
    // "no document to update" errors for first-time users.
    fetchProfile()
      .then(() => {
        router.replace("/dashboard");
      })
      .catch((error) => {
        logger.error("LoginFinishPage", "Failed to fetch profile", error);
        // Redirect to dashboard anyway — profile will be created on next load
        router.replace("/dashboard");
      });
  }, [isLoaded, isSignedIn, user, router, setAuthDetails, fetchProfile]);

  return <LoadingState message="Completing sign in..." />;
}
