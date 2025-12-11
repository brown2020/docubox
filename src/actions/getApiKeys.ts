"use server";

import { type APIType } from "@/constants/credits";

const API_KEY_ENV_VARS: Record<APIType, string> = {
  unstructured: "UNSTRUCTURED_API_KEY",
  "open-ai": "OPENAI_API_KEY",
  ragie: "RAGIE_API_KEY",
};

/**
 * Gets the server-side API key for a given service type.
 * This is used when the user opts to use platform credits instead of their own keys.
 */
export async function getApiKey(type: APIType): Promise<string> {
  const envVar = API_KEY_ENV_VARS[type];
  const apiKey = process.env[envVar];

  if (!apiKey) {
    throw new Error(
      `Server API key for ${type} is not configured. Please contact support.`
    );
  }

  return apiKey;
}
