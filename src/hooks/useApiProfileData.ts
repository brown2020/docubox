"use client";

import { useMemo } from "react";
import useProfileStore from "@/zustand/useProfileStore";
import type { APIProfileData } from "@/utils/useApiAndCreditKeys";

/**
 * Custom hook that provides memoized profile data for API/credit handling.
 * Eliminates duplicate useMemo patterns across components.
 *
 * @returns Memoized APIProfileData object with profile and minusCredits
 */
export function useApiProfileData(): APIProfileData {
  const profile = useProfileStore((state) => state.profile);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  return useMemo(() => ({ profile, minusCredits }), [profile, minusCredits]);
}
