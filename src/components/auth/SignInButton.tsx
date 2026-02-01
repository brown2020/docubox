"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  children?: ReactNode;
  mode?: "redirect" | "modal"; // modal mode will just redirect for now
  className?: string;
}

/**
 * Sign in button component - replaces Clerk's SignInButton.
 * Redirects to /login page with optional redirect URL.
 */
export function SignInButton({
  children,
  mode: _mode,
  className,
}: SignInButtonProps) {
  const router = useRouter();

  function handleClick() {
    // Store current path for redirect after sign in
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/login") {
        sessionStorage.setItem("redirectAfterSignIn", currentPath);
      }
    }
    router.push("/login");
  }

  return (
    <Button onClick={handleClick} variant="outline" className={className}>
      {children ?? "Sign In"}
    </Button>
  );
}
