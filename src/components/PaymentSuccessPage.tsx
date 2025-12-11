"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { validatePaymentIntent } from "@/actions/paymentActions";
import { logger } from "@/lib/logger";

type Props = {
  payment_intent: string;
};

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  created: number;
}

const initialPaymentData: PaymentData = {
  id: "",
  amount: 0,
  status: "",
  created: 0,
};

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] =
    useState<PaymentData>(initialPaymentData);

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
          // Check if payment is already processed
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
            created: data.created * 1000, // UNIX timestamp in seconds to ms
          });

          // Add payment to store
          await addPayment({
            id: data.id,
            amount: data.amount,
            status: data.status,
          });

          // Add credits to profile
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

  return (
    <main className="max-w-6xl flex flex-col gap-2.5 mx-auto p-10 text-black text-center border m-10 rounded-md border-black">
      {loading ? (
        <div>validating...</div>
      ) : paymentData.id ? (
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
          <h2 className="text-2xl">You successfully purchased credits</h2>
          <div className="bg-white p-2 rounded-md my-5 text-4xl font-bold mx-auto">
            ${paymentData.amount / 100}
          </div>
          <div>Uid: {uid}</div>
          <div>Id: {paymentData.id}</div>
          <div>Created: {new Date(paymentData.created).toLocaleString()}</div>
          <div>Status: {paymentData.status}</div>
        </div>
      ) : (
        <div>{message}</div>
      )}

      <Link
        href="/profile"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:opacity-50"
      >
        View Account
      </Link>
    </main>
  );
}
