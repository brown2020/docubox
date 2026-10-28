"use client";

import { getCreditCost } from "@/constants/credits";
import {
  type APIType,
  getProfileFieldName,
  getAPIDisplayName,
} from "@/constants/apiConfig";
import type { ApiRequest } from "@/types/api-request";
import { ProfileType } from "@/zustand/useProfileStore";

export type { APIType };

/**
 * Profile data used to build an API request. Credits are charged on the server.
 */
export interface APIProfileData {
  profile: ProfileType;
  refreshProfile?: () => Promise<void>;
}

/**
 * Builds a server-action credential. Never fetches platform API keys.
 * When credits are enabled and the user also has a key saved, both are sent
 * so the server can pick the key that indexed a Ragie file.
 */
export function describeApiRequest(apiType: APIType, profile: ProfileType): ApiRequest {
  const displayName = getAPIDisplayName(apiType);
  const field = profile[getProfileFieldName(apiType)];
  const userApiKey = typeof field === "string" && field.trim() ? field.trim() : undefined;

  if (!profile.useCredits && !userApiKey) {
    throw new Error(
      `No ${displayName} API key found. Please add your API key in profile settings or enable credits.`
    );
  }

  if (
    profile.useCredits &&
    !userApiKey &&
    profile.credits < getCreditCost(apiType)
  ) {
    const requiredCredits = getCreditCost(apiType);
    throw new Error(
      `Insufficient credits. You need ${requiredCredits} credits but only have ${profile.credits}.`
    );
  }

  return { useCredits: profile.useCredits, userApiKey };
}

/**
 * Resolves how to call an API and refreshes the credit balance afterward.
 * The callback receives a credential, not a platform secret.
 */
const handleAPIAndCredits = async (
  apiType: APIType,
  profileData: APIProfileData,
  callback: (auth: ApiRequest) => Promise<void>
): Promise<void> => {
  const auth = describeApiRequest(apiType, profileData.profile);
  await callback(auth);
  if (profileData.profile.useCredits && profileData.refreshProfile) {
    await profileData.refreshProfile();
  }
};

export { handleAPIAndCredits };
