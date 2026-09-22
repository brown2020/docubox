import type { Metadata } from "next";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Confirm your Docubox credit purchase.",
};

export default function PaymentSuccess() {
  return <PaymentSuccessClient />;
}
