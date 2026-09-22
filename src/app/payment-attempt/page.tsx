import type { Metadata } from "next";
import PaymentAttemptClient from "./PaymentAttemptClient";

export const metadata: Metadata = {
  title: "Buy Credits",
  description: "Purchase Docubox usage credits.",
};

export default function PaymentAttempt() {
  return <PaymentAttemptClient />;
}
