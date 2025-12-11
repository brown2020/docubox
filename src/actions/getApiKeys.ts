"use server";

import {
  type APIType,
  getEnvVarName,
  getAPIDisplayName,
} from "@/constants/apiConfig";

/**
 * Gets the server-side API key for a given service type.
 * This is used when the user opts to use platform credits instead of their own keys.
 */
export async function getApiKey(type: APIType): Promise<string> {
  const envVar = getEnvVarName(type);
  const apiKey = process.env[envVar];

  if (!apiKey) {
    throw new Error(
      `Server API key for ${getAPIDisplayName(
        type
      )} is not configured. Please contact support.`
    );
  }

  return apiKey;
}
