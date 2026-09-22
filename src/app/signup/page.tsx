import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Docubox account to store documents and summarize with AI.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm initialMode="signup" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:no-underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:no-underline">
          Privacy Policy
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline hover:no-underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
