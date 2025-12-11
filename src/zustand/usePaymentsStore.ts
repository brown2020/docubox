import { create } from "zustand";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { db } from "@/firebase";
import { logger } from "@/lib/logger";

export type PaymentType = {
  id: string;
  amount: number;
  createdAt: Timestamp | null;
  status: string;
};

/**
 * Sorts payments by createdAt (newest first) with null safety.
 */
function sortPaymentsByDate(payments: PaymentType[]): PaymentType[] {
  return [...payments].sort((a, b) => {
    const aTime = a.createdAt?.toMillis() ?? 0;
    const bTime = b.createdAt?.toMillis() ?? 0;
    return bTime - aTime;
  });
}

interface PaymentsStoreState {
  payments: PaymentType[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  fetchPayments: () => Promise<void>;
  addPayment: (payment: Omit<PaymentType, "createdAt">) => Promise<void>;
  checkIfPaymentProcessed: (paymentId: string) => Promise<PaymentType | null>;
}

export const usePaymentsStore = create<PaymentsStoreState>((set) => ({
  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  fetchPayments: async () => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      logger.error("usePaymentsStore", "Invalid UID for fetchPayments");
      return;
    }

    set({ paymentsLoading: true });

    try {
      const q = query(collection(db, "users", uid, "payments"));
      const querySnapshot = await getDocs(q);
      const payments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().amount,
        createdAt: doc.data().createdAt,
        status: doc.data().status,
      }));

      set({ payments: sortPaymentsByDate(payments), paymentsLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      logger.error("usePaymentsStore", "Error fetching payments", error);
      set({ paymentsError: errorMessage, paymentsLoading: false });
    }
  },

  addPayment: async (payment) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      logger.error("usePaymentsStore", "Invalid UID for addPayment");
      return;
    }

    set({ paymentsLoading: true });

    try {
      // Query to check if the payment with the same id already exists
      const q = query(
        collection(db, "users", uid, "payments"),
        where("id", "==", payment.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Payment with this ID already exists.");
        set({ paymentsLoading: false });
        return;
      }

      const newPaymentDoc = await addDoc(
        collection(db, "users", uid, "payments"),
        {
          id: payment.id,
          amount: payment.amount,
          createdAt: Timestamp.now(),
          status: payment.status,
        }
      );

      const newPayment = {
        id: newPaymentDoc.id,
        amount: payment.amount,
        createdAt: Timestamp.now(),
        status: payment.status,
      };

      set((state) => ({
        payments: sortPaymentsByDate([...state.payments, newPayment]),
        paymentsLoading: false,
      }));

      toast.success("Payment added successfully.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      logger.error("usePaymentsStore", "Error adding payment", error);
      set({ paymentsError: errorMessage, paymentsLoading: false });
    }
  },

  checkIfPaymentProcessed: async (paymentId) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return null;

    const paymentsRef = collection(db, "users", uid, "payments");
    const q = query(
      paymentsRef,
      where("id", "==", paymentId),
      where("status", "==", "succeeded")
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as PaymentType;
    }

    return null;
  },
}));
