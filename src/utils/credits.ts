import { getCreditCost, type APIType } from "@/constants/credits";

/**
 * Gets the number of credits to deduct for a given API operation.
 * @deprecated Use getCreditCost from @/constants/credits directly
 */
export const creditsToMinus = (model: APIType): number => {
  return getCreditCost(model);
};
