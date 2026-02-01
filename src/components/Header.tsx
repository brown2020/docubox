"use client";

import { SignedIn, SignedOut, UserMenu, SignInButton } from "@/components/auth";
import Link from "next/link";
import { ThemeToggler } from "./ThemeToggler";
import { Button } from "./ui/button";

/**
 * Application header component.
 * Auth initialization is handled by AuthProvider in layout.
 */
export default function Header() {
  return (
    <header className="h-14 flex items-center px-3 sticky top-0 justify-between bg-slate-200 dark:bg-slate-600 p-3">
      <div className="flex gap-x-3">
        <Link href="/dashboard">
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
          <UserMenu />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
}
