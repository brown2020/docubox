"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { validatePaymentIntent } from "@/actions/paymentActions";
import { CREDIT_PACKAGE_CREDITS } from "@/constants/billing";
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
  alreadyProcessed: boolean;
}

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const fetchPayments = usePaymentsStore((state) => state.fetchPayments);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const uid = useAuthStore((state) => state.uid);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!payment_intent) {
      setMessage("No payment intent found");
      setLoading(false);
      return;
    }
    if (!uid) return;

    let cancelled = false;

    validatePaymentIntent(payment_intent)
      .then(async (data) => {
        if (cancelled || !isMountedRef.current) return;
        if (data.status !== "succeeded") {
          setMessage("Payment validation failed");
          return;
        }

        setMessage(data.alreadyProcessed ? "Payment has already been processed." : "Payment successful");
        setPaymentData({
          id: data.id,
          amount: data.amount,
          status: data.status,
          created: data.created * 1000,
          alreadyProcessed: data.alreadyProcessed,
        });
        await Promise.all([fetchProfile(), fetchPayments()]);
      })
      .catch((error) => {
        if (cancelled || !isMountedRef.current) return;
        logger.error("PaymentSuccessPage", "Error handling payment", error);
        setMessage("Error handling payment success");
      })
      .finally(() => {
        if (!cancelled && isMountedRef.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payment_intent, fetchPayments, fetchProfile, uid]);

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
            {paymentData.alreadyProcessed
              ? "This purchase was already applied to your account"
              : `You received ${CREDIT_PACKAGE_CREDITS.toLocaleString()} credits`}
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
