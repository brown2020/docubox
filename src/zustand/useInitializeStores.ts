import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import useProfileStore from "./useProfileStore";

/**
 * Hook to initialize stores when the user is authenticated.
 * Fetches user profile data once the uid is available.
 */
export const useInitializeStores = () => {
  const uid = useAuthStore((state) => state.uid);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    if (!uid) return;
    fetchProfile();
  }, [fetchProfile, uid]);
};
