"use client";

import { useMemo } from "react";
import useProfileStore from "@/zustand/useProfileStore";
import type { APIProfileData } from "@/utils/useApiAndCreditKeys";

/**
 * Profile snapshot plus a refresh used after server-side credit debits.
 */
export function useApiProfileData(): APIProfileData {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.fetchProfile);

  return useMemo(
    () => ({ profile, refreshProfile }),
    [profile, refreshProfile]
  );
}
