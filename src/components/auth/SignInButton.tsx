"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  children?: ReactNode;
  /** Currently only "redirect" is supported (modal just redirects too) */
  mode?: "redirect" | "modal";
  className?: string;
}

/**
 * Sign in button component - replaces Clerk's SignInButton.
 * Redirects to /login page with optional redirect URL.
 */
export function SignInButton({
  children,
  // mode is kept for API compatibility but currently unused
  mode: _mode = "redirect",
  className,
}: SignInButtonProps) {
  // Suppress unused variable warning - mode kept for future modal support
  void _mode;
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
