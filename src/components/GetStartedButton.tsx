"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useIsMounted } from "@/hooks/useIsMounted";

/**
 * Smart "Get Started" button that handles auth-aware navigation.
 * - Signed in: Links directly to dashboard
 * - Signed out: Opens Clerk sign-in (avoids CORS issues with RSC redirects)
 */
export function GetStartedButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const isMounted = useIsMounted();

  const buttonClasses =
    "mt-10 flex items-center px-5 py-3 bg-green-500 text-white rounded-lg hover:opacity-80 transition-opacity duration-300 w-fit";

  // Show placeholder while loading to prevent hydration mismatch
  if (!isMounted || !isLoaded) {
    return (
      <div className={`${buttonClasses} opacity-70 cursor-wait`}>
        <div>Get Started</div>
        <ArrowRightIcon className="ml-2" />
      </div>
    );
  }

  // Signed in users get a direct link to dashboard
  if (isSignedIn) {
    return (
      <Link href="/dashboard" className={buttonClasses}>
        <div>Get Started</div>
        <ArrowRightIcon className="ml-2" />
      </Link>
    );
  }

  // Signed out users get Clerk's sign-in flow
  // This avoids CORS issues with RSC redirects
  return (
    <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
      <button className={buttonClasses}>
        <div>Get Started</div>
        <ArrowRightIcon className="ml-2" />
      </button>
    </SignInButton>
  );
}
