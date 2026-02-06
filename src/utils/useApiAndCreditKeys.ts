"use client";

import { getApiKey } from "@/actions/getApiKeys";
import { getCreditCost } from "@/constants/credits";
import {
  type APIType,
  getProfileFieldName,
  getAPIDisplayName,
} from "@/constants/apiConfig";
import { ProfileType } from "@/zustand/useProfileStore";

// Re-export APIType for backwards compatibility
export type { APIType };

/**
 * Simplified profile data interface for API/credit handling.
 * Only includes what's actually needed by handleAPIAndCredits.
 */
export interface APIProfileData {
  profile: ProfileType;
  minusCredits: (amount: number) => Promise<boolean>;
}

/**
 * Handles API key resolution and credit deduction for API calls.
 * If useCredits is enabled, uses environment API key and deducts credits.
 * Otherwise, uses the user's own API key from their profile.
 */
const handleAPIAndCredits = async (
  apiType: APIType,
  profileData: APIProfileData,
  callback: (apiKey: string) => Promise<void>
): Promise<void> => {
  const { profile, minusCredits } = profileData;
  const requiredCredits = getCreditCost(apiType);
  const displayName = getAPIDisplayName(apiType);

  if (profile.useCredits) {
    // Using platform credits - validate and use env API key
    if (profile.credits < requiredCredits) {
      throw new Error(
        `Insufficient credits. You need ${requiredCredits} credits but only have ${profile.credits}.`
      );
    }

    const envApiKey = await getApiKey(apiType);
    if (!envApiKey) {
      throw new Error(`Platform API key for ${displayName} is not configured.`);
    }

    await callback(envApiKey);
    await minusCredits(requiredCredits);
  } else {
    // Using user's own API key
    const apiKeyField = getProfileFieldName(apiType);
    const apiKey = profile[apiKeyField];

    if (typeof apiKey !== "string" || !apiKey) {
      throw new Error(
        `No ${displayName} API key found. Please add your API key in profile settings or enable credits.`
      );
    }

    await callback(apiKey);
  }
};

export { handleAPIAndCredits };
