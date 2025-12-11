/**
 * Credit costs for different API operations.
 * Centralized configuration for credit deduction.
 */
export const CREDIT_COSTS = {
  "open-ai": 4,
  unstructured: 4,
  ragie: 8,
} as const;

export type APIType = keyof typeof CREDIT_COSTS;

/**
 * Gets the credit cost for a specific API type.
 * Uses environment variable override if available, otherwise falls back to default.
 */
export function getCreditCost(apiType: APIType): number {
  const envVarMap: Record<APIType, string> = {
    "open-ai": "NEXT_PUBLIC_CREDITS_PER_OPEN_AI",
    unstructured: "NEXT_PUBLIC_CREDITS_PER_UNSTRUCTURED",
    ragie: "NEXT_PUBLIC_CREDITS_PER_RAGIE",
  };

  const envValue = process.env[envVarMap[apiType]];
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed)) return parsed;
  }

  return CREDIT_COSTS[apiType];
}

