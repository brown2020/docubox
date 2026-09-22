import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Docubox password via email link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm initialMode="forgot" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline hover:no-underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
