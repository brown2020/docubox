"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggler } from "./ThemeToggler";
import { Button } from "./ui/button";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import { useFirebaseAuthSync } from "@/hooks/useFirebaseAuthSync";
import { SafeSignInButton, SafeUserButton } from "./ClerkClientComponents";

export default function Header() {
  // Initialize stores and sync Firebase auth
  useInitializeStores();
  useFirebaseAuthSync();

  return (
    <header className="h-14 flex items-center px-3 sticky top-0 justify-between bg-slate-200 dark:bg-slate-600 p-3">
      <div className="flex gap-x-3">
        <Link href={"/dashboard"}>
          <Button size="sm" className="bg-green-500 hover:bg-green-400">
            Docubox
          </Button>
        </Link>
      </div>

      <div className="flex space-x-2 items-center gap-5">
        <ThemeToggler />
        <SignedIn>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profile</Link>

          <SafeUserButton />
        </SignedIn>
        <SignedOut>
          <SafeSignInButton mode={"modal"} />
        </SignedOut>
      </div>
    </header>
  );
}
