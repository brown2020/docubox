import {
  CREDIT_PACKAGE_CENTS,
  CREDIT_PACKAGE_CREDITS,
} from "@/constants/billing";

export type PaymentGrantInput = {
  callerUserId: string;
  metadataUserId?: string | null;
  amount?: number | null;
  status?: string | null;
};

/** Server-side check before any credit grant. Client amounts are ignored. */
export function paymentGrantDecision(
  input: PaymentGrantInput
): { ok: true; credits: number } | { ok: false } {
  if (input.status !== "succeeded") return { ok: false };
  if (!input.callerUserId || input.metadataUserId !== input.callerUserId) {
    return { ok: false };
  }
  if (input.amount !== CREDIT_PACKAGE_CENTS) return { ok: false };
  return { ok: true, credits: CREDIT_PACKAGE_CREDITS };
}
