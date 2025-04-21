"use client";

import { UserButton, SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function SafeUserButton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />;
  }

  return <UserButton />;
}

export function SafeSignInButton({ mode }: { mode: "modal" | "redirect" }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-20 h-8 rounded-md bg-gray-300 animate-pulse" />;
  }

  return <SignInButton mode={mode} />;
}
