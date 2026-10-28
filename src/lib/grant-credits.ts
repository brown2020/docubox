import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { CREDIT_PACKAGE_CREDITS } from "@/constants/billing";
import { paymentGrantDecision, type PaymentGrantInput } from "@/lib/payment-grant";

const PAYMENT_ID = /^pi_[A-Za-z0-9]+$/;

export async function grantPackageCredits(
  input: PaymentGrantInput & { paymentIntentId: string; created?: number | null }
): Promise<{ granted: boolean; credits: number }> {
  if (!PAYMENT_ID.test(input.paymentIntentId)) {
    throw new Error("Payment was not successful");
  }

  const decision = paymentGrantDecision(input);
  if (!decision.ok) {
    throw new Error("Payment was not successful");
  }

  const userId = input.callerUserId;
  const payRef = adminDb.doc(`users/${userId}/payments/${input.paymentIntentId}`);
  const profileRef = adminDb.doc(`users/${userId}/profile/userData`);

  return adminDb.runTransaction(async (tx) => {
    const paySnap = await tx.get(payRef);
    const profileSnap = await tx.get(profileRef);
    const current =
      profileSnap.exists && typeof profileSnap.get("credits") === "number"
        ? profileSnap.get("credits")
        : 0;

    if (paySnap.exists) {
      return { granted: false, credits: current };
    }

    const next = current + CREDIT_PACKAGE_CREDITS;
    if (profileSnap.exists) {
      tx.update(profileRef, { credits: next });
    } else {
      tx.set(profileRef, { email: "", useCredits: true, credits: next }, { merge: true });
    }

    tx.set(payRef, {
      id: input.paymentIntentId,
      amount: input.amount,
      status: "succeeded",
      creditsGranted: CREDIT_PACKAGE_CREDITS,
      createdAt:
        typeof input.created === "number"
          ? Timestamp.fromMillis(input.created * 1000)
          : FieldValue.serverTimestamp(),
    });

    return { granted: true, credits: next };
  });
}
