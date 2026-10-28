import { INITIAL_FREE_CREDITS } from "@/constants/billing";

/**
 * Mirrors firestore.rules for users/{uid}/profile/userData.
 * Clients may create the free balance once and may not change it afterward.
 */
export function clientProfileWriteAllowed(input: {
  isCreate: boolean;
  docId: string;
  credits: number;
  previousCredits?: number;
}): boolean {
  if (input.docId !== "userData") return false;
  if (typeof input.credits !== "number" || !Number.isFinite(input.credits)) return false;
  if (input.credits < 0) return false;
  if (input.isCreate) return input.credits === INITIAL_FREE_CREDITS;
  return input.credits === input.previousCredits;
}
