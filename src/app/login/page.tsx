"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm />
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
    </div>
  );
}
