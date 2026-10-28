"use client";

import PaymentCheckoutPage from "@/components/PaymentCheckoutPage";
import { CREDIT_PACKAGE_CENTS } from "@/constants/billing";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo } from "react";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
const packageAmount = CREDIT_PACKAGE_CENTS / 100;

export default function PaymentAttemptClient() {
  const stripePromise = useMemo(
    () => (stripeKey ? loadStripe(stripeKey) : null),
    []
  );

  if (!stripeKey || !stripePromise) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Payments are unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          Card checkout is not configured. Add a Stripe publishable key to enable credit purchases.
        </p>
      </main>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: CREDIT_PACKAGE_CENTS,
        currency: "usd",
      }}
    >
      <PaymentCheckoutPage amount={packageAmount} />
    </Elements>
  );
}
