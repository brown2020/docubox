"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { createPaymentIntent } from "@/actions/paymentActions";
import convertToSubcurrency from "@/utils/convertToSubcurrency";
import { LoadingState } from "./common/LoadingState";
import { Button } from "./ui/button";

type Props = { amount: number };

export default function PaymentCheckoutPage({ amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initializePayment() {
      try {
        const secret = await createPaymentIntent(convertToSubcurrency(amount));
        if (secret) {
          setClientSecret(secret);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(
            error.message || "Failed to initialize payment. Please try again."
          );
        } else {
          setErrorMessage(
            "An unknown error occurred while initializing payment."
          );
        }
      }
    }

    initializePayment();
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Payment submission failed");
        setLoading(false);
        return;
      }

      const paymentResult = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?amount=${amount}`,
        },
      });

      if (paymentResult.error) {
        setErrorMessage(paymentResult.error.message || "Payment failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(
          err.message || "Payment validation failed. Please try again."
        );
      } else {
        setErrorMessage("An unknown error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center max-w-6xl h-36 mx-auto w-full">
        <LoadingState message="Initializing payment..." size={40} />
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full items-center max-w-6xl mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Buy 10,000 Credits</h1>
        <h2 className="text-2xl mt-2">
          Purchase amount: <span className="font-bold">${amount}</span>
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-md w-full max-w-md"
      >
        {clientSecret && <PaymentElement />}

        {errorMessage && (
          <p className="text-destructive text-sm mt-2">{errorMessage}</p>
        )}

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full mt-4 py-6 text-lg font-semibold"
        >
          {loading ? "Processing..." : `Pay $${amount}`}
        </Button>
      </form>
    </main>
  );
}
