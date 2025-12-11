"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { validatePaymentIntent } from "@/actions/paymentActions";
import { logger } from "@/lib/logger";
import { LoadingState } from "./common/LoadingState";
import { Button } from "./ui/button";

type Props = {
  payment_intent: string;
};

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  created: number;
}

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const addPayment = usePaymentsStore((state) => state.addPayment);
  const checkIfPaymentProcessed = usePaymentsStore(
    (state) => state.checkIfPaymentProcessed
  );
  const addCredits = useProfileStore((state) => state.addCredits);
  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    if (!payment_intent) {
      setMessage("No payment intent found");
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        const data = await validatePaymentIntent(payment_intent);

        if (data.status === "succeeded") {
          const existingPayment = await checkIfPaymentProcessed(data.id);
          if (existingPayment) {
            setMessage("Payment has already been processed.");
            setPaymentData({
              id: existingPayment.id,
              amount: existingPayment.amount,
              status: existingPayment.status,
              created: existingPayment.createdAt?.toMillis() ?? 0,
            });
            setLoading(false);
            return;
          }

          setMessage("Payment successful");
          setPaymentData({
            id: data.id,
            amount: data.amount,
            status: data.status,
            created: data.created * 1000,
          });

          await addPayment({
            id: data.id,
            amount: data.amount,
            status: data.status,
          });

          const creditsToAdd = data.amount + 1;
          await addCredits(creditsToAdd);
        } else {
          setMessage("Payment validation failed");
        }
      } catch (error) {
        logger.error("PaymentSuccessPage", "Error handling payment", error);
        setMessage("Error handling payment success");
      } finally {
        setLoading(false);
      }
    };

    if (uid) handlePaymentSuccess();
  }, [payment_intent, addPayment, checkIfPaymentProcessed, addCredits, uid]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-10 m-10">
        <LoadingState message="Validating payment..." />
      </main>
    );
  }

  return (
    <main className="max-w-6xl flex flex-col gap-4 mx-auto p-10 text-center border m-10 rounded-md dark:border-slate-600">
      {paymentData ? (
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
          <h2 className="text-2xl text-muted-foreground">
            You successfully purchased credits
          </h2>
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md my-5 text-4xl font-bold mx-auto inline-block">
            ${paymentData.amount / 100}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>ID: {paymentData.id}</div>
            <div>Created: {new Date(paymentData.created).toLocaleString()}</div>
            <div className="capitalize">Status: {paymentData.status}</div>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground py-8">{message}</div>
      )}

      <Button asChild className="mx-auto">
        <Link href="/profile">View Account</Link>
      </Button>
    </main>
  );
}
