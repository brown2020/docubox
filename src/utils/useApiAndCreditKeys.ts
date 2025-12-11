"use client";

import { getApiKey } from "@/actions/getApiKeys";
import { getCreditCost, type APIType } from "@/constants/credits";
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
 * Maps API type to the corresponding profile field name.
 */
const API_KEY_FIELDS: Record<APIType, keyof ProfileType> = {
  "open-ai": "openai_api_key",
  unstructured: "unstructured_api_key",
  ragie: "ragie_api_key",
};

/**
 * Formats API type name for display in error messages.
 */
const formatAPIName = (apiType: APIType): string => {
  if (apiType === "open-ai") return "OpenAI";
  return apiType.charAt(0).toUpperCase() + apiType.slice(1);
};

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

  if (profile.useCredits) {
    // Using platform credits - validate and use env API key
    if (profile.credits < requiredCredits) {
      throw new Error(
        `Insufficient credits. You need ${requiredCredits} credits but only have ${profile.credits}.`
      );
    }

    const envApiKey = await getApiKey(apiType);
    if (!envApiKey) {
      throw new Error(
        `Platform API key for ${formatAPIName(apiType)} is not configured.`
      );
    }

    await callback(envApiKey);
    await minusCredits(requiredCredits);
  } else {
    // Using user's own API key
    const apiKeyField = API_KEY_FIELDS[apiType];
    const apiKey = profile[apiKeyField];

    if (!apiKey) {
      throw new Error(
        `No ${formatAPIName(
          apiType
        )} API key found. Please add your API key in profile settings or enable credits.`
      );
    }

    await callback(apiKey as string);
  }
};

export { handleAPIAndCredits };
