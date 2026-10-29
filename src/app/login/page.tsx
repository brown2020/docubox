import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm, SignedOut } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Docubox to store and summarize your documents.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm initialMode="signin" />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:no-underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:no-underline">
          Privacy Policy
        </Link>
      </p>
      <SignedOut>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-primary underline hover:no-underline">
            Create an account
          </Link>
        </p>
      </SignedOut>
    </div>
  );
}
