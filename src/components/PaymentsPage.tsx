"use client";

import { memo } from "react";
import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore, PaymentType } from "@/zustand/usePaymentsStore";
import { useEffect } from "react";
import { LoadingState } from "./common/LoadingState";

/**
 * Individual payment card component - memoized to prevent re-renders.
 */
const PaymentCard = memo(function PaymentCard({
  payment,
}: {
  payment: PaymentType;
}) {
  return (
    <div className="border p-4 rounded-md bg-white dark:bg-slate-700 shadow-md">
      <div className="text-sm text-muted-foreground">ID: {payment.id}</div>
      <div className="text-lg font-semibold">${payment.amount / 100}</div>
      <div className="text-sm">
        {payment.createdAt
          ? payment.createdAt.toDate().toLocaleString()
          : "N/A"}
      </div>
      <div className="text-sm capitalize">{payment.status}</div>
    </div>
  );
});

export default function PaymentsPage() {
  const uid = useAuthStore((state) => state.uid);
  const payments = usePaymentsStore((state) => state.payments);
  const paymentsLoading = usePaymentsStore((state) => state.paymentsLoading);
  const paymentsError = usePaymentsStore((state) => state.paymentsError);
  const fetchPayments = usePaymentsStore((state) => state.fetchPayments);

  useEffect(() => {
    if (uid) {
      fetchPayments();
    }
  }, [uid, fetchPayments]);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-4">
      <div className="text-3xl font-bold">Payments</div>

      {paymentsLoading && (
        <LoadingState
          message="Loading payments..."
          size={32}
          fullHeight={false}
        />
      )}

      {paymentsError && (
        <div className="text-destructive p-4 border border-destructive rounded-md">
          Error: {paymentsError}
        </div>
      )}

      {!paymentsLoading && !paymentsError && (
        <div className="flex flex-col gap-2">
          {payments.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No payments yet
            </div>
          ) : (
            payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
