import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Credits",
  description: "Purchase credits for document processing and AI features.",
};

export default function PaymentAttemptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
