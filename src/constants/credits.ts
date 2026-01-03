/**
 * Credit costs for different API operations.
 * Centralized configuration for credit deduction.
 */
import type { APIType } from "./apiConfig";

export const CREDIT_COSTS: Record<APIType, number> = {
  "open-ai": 4,
  unstructured: 4,
  ragie: 8,
} as const;

// Re-export APIType for backwards compatibility
export type { APIType };

const CREDIT_ENV_VARS: Record<APIType, string> = {
  "open-ai": "NEXT_PUBLIC_CREDITS_PER_OPEN_AI",
  unstructured: "NEXT_PUBLIC_CREDITS_PER_UNSTRUCTURED",
  ragie: "NEXT_PUBLIC_CREDITS_PER_RAGIE",
};

/**
 * Gets the credit cost for a specific API type.
 * Uses environment variable override if available, otherwise falls back to default.
 */
export function getCreditCost(apiType: APIType): number {
  const envValue = process.env[CREDIT_ENV_VARS[apiType]];
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed)) return parsed;
  }

  return CREDIT_COSTS[apiType];
}



