"use client";

import { SignedIn, SignedOut, UserMenu, SignInButton } from "@/components/auth";
import Link from "next/link";
import { ThemeToggler } from "./ThemeToggler";
import { FileBox, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

/**
 * Application header component with improved accessibility and responsive design.
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary"
          aria-label="Docubox home"
        >
          <FileBox className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Docubox</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 sm:flex">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Profile
            </Link>
          </SignedIn>
          <div className="flex items-center gap-3">
            <ThemeToggler />
            <SignedIn>
              <UserMenu />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 sm:hidden">
          <ThemeToggler />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-b border-border bg-background px-4 py-4 sm:hidden"
          role="menu"
        >
          <div className="flex flex-col gap-3">
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                role="menuitem"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                role="menuitem"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <div className="pt-2">
                <UserMenu />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="pt-2">
                <SignInButton />
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
