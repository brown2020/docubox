import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import useProfileStore from "./useProfileStore";

/**
 * Hook to initialize stores when the user is authenticated.
 * Fetches user profile data once the uid is available AND auth is ready.
 * This prevents race conditions where profile is fetched before auth completes.
 */
export const useInitializeStores = () => {
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    // Wait for both uid and authReady to prevent race condition
    if (!uid || !authReady) return;
    fetchProfile();
  }, [fetchProfile, uid, authReady]);
};
