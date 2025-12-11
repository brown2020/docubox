/**
 * Centralized API configuration.
 * Maps API types to their environment variables, profile fields, and display names.
 */

import type { ProfileType } from "@/zustand/useProfileStore";

export type APIType = "open-ai" | "unstructured" | "ragie";

export interface APIConfigEntry {
  /** Environment variable name for server-side API key */
  envVar: string;
  /** Field name in user profile for user's own API key */
  profileField: keyof ProfileType;
  /** Human-readable display name */
  displayName: string;
}

/**
 * Configuration for each supported API type.
 */
export const API_CONFIG: Record<APIType, APIConfigEntry> = {
  "open-ai": {
    envVar: "OPENAI_API_KEY",
    profileField: "openai_api_key",
    displayName: "OpenAI",
  },
  unstructured: {
    envVar: "UNSTRUCTURED_API_KEY",
    profileField: "unstructured_api_key",
    displayName: "Unstructured",
  },
  ragie: {
    envVar: "RAGIE_API_KEY",
    profileField: "ragie_api_key",
    displayName: "Ragie",
  },
} as const;

/**
 * Gets the environment variable name for an API type.
 */
export function getEnvVarName(apiType: APIType): string {
  return API_CONFIG[apiType].envVar;
}

/**
 * Gets the profile field name for an API type.
 */
export function getProfileFieldName(apiType: APIType): keyof ProfileType {
  return API_CONFIG[apiType].profileField;
}

/**
 * Gets the display name for an API type.
 */
export function getAPIDisplayName(apiType: APIType): string {
  return API_CONFIG[apiType].displayName;
}
