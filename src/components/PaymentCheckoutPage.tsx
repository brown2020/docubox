"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import { useEffect, useState } from "react";
import { createPaymentIntent } from "@/actions/paymentActions";
import convertToSubcurrency from "@/utils/convertToSubcurrency";
import Spinner from "./common/spinner";

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
        // Ensure type-safe error handling
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
      // Confirm the Payment Element is submitted
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Payment submission failed");
        setLoading(false);
        return;
      }

      // Confirm the Payment
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
      // Success case: Stripe redirects to return_url automatically
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
        <Spinner size={"50"} />
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full items-center max-w-6xl mx-auto py-10">
      <div className="mb-10">
        <h1 className="text-4xl">Buy 10,000 Credits</h1>
        <h2 className="text-2xl">
          Purchase amount: <span className="font-bold">${amount}</span>
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md w-full">
        {clientSecret && <PaymentElement />}

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          disabled={!stripe || loading}
          className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
        >
          {!loading ? `Pay $${amount}` : "Processing..."}
        </button>
      </form>
    </main>
  );
}
