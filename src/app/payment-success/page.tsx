"use client";

import PaymentSuccessPage from "@/components/PaymentSuccessPage";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Define the prop types for ClientOnlyComponent
interface ClientOnlyComponentProps {
  setPaymentIntent: React.Dispatch<React.SetStateAction<string>>;
}

function ClientOnlyComponent({ setPaymentIntent }: ClientOnlyComponentProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const payment_intent = searchParams.get("payment_intent") || "";
      setPaymentIntent(payment_intent);
    }
  }, [searchParams, setPaymentIntent]);

  return null;
}

export default function PaymentSuccess() {
  const [paymentIntent, setPaymentIntent] = useState<string>("");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientOnlyComponent setPaymentIntent={setPaymentIntent} />
      {paymentIntent && <PaymentSuccessPage payment_intent={paymentIntent} />}
    </Suspense>
  );
}
