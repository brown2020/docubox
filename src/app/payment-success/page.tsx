"use client";

import PaymentSuccessPage from "@/components/PaymentSuccessPage";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/LoadingState";

/**
 * Inner component that reads search params.
 * Separated to allow Suspense boundary for useSearchParams.
 */
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent") || "";

  if (!paymentIntent) {
    return (
      <div className="max-w-6xl mx-auto p-10 m-10 text-center">
        <p className="text-muted-foreground">No payment information found.</p>
      </div>
    );
  }

  return <PaymentSuccessPage payment_intent={paymentIntent} />;
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-10 m-10">
          <LoadingState message="Loading payment details..." />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
