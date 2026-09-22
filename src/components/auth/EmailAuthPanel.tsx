"use client";

import Link from "next/link";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  mode: "signin" | "signup";
  email: string;
  password: string;
  displayName: string;
  loading: boolean;
  magicLinkSent: boolean;
  errorId?: string;
  hasError: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
  onMagicSubmit: (e: React.FormEvent) => void;
  onResetMagic: () => void;
};

export function EmailAuthPanel({
  mode,
  email,
  password,
  displayName,
  loading,
  magicLinkSent,
  errorId,
  hasError,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onEmailSubmit,
  onMagicSubmit,
  onResetMagic,
}: Props) {
  const submitLabel = mode === "signup" ? "Create Account" : "Sign In";

  return (
    <Tabs defaultValue="email" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email">Email & Password</TabsTrigger>
        <TabsTrigger value="magic">Email Link</TabsTrigger>
      </TabsList>

      <TabsContent value="email">
        <form onSubmit={onEmailSubmit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Name (optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => onDisplayNameChange(e.target.value)}
                  className="pl-9"
                  autoComplete="name"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                className="pl-9"
                autoComplete="username"
                aria-describedby={hasError ? errorId : undefined}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <PasswordInput
                id="password"
                name="password"
                placeholder={
                  mode === "signup" ? "At least 6 characters" : "••••••••"
                }
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="pl-9"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                aria-describedby={hasError ? errorId : undefined}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
          {mode === "signin" ? (
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary underline hover:no-underline"
              >
                Create one
              </Link>
              {" · "}
              <Link
                href="/forgot-password"
                className="text-primary underline hover:no-underline"
              >
                Forgot password?
              </Link>
            </p>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary underline hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </form>
      </TabsContent>

      <TabsContent value="magic">
        {magicLinkSent ? (
          <div className="text-center py-4">
            <Mail className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="font-medium">Check your email!</p>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
            <Button variant="link" onClick={onResetMagic} className="mt-4">
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={onMagicSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Sign-In Link
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              We&apos;ll email you a magic link for password-free sign in.
            </p>
          </form>
        )}
      </TabsContent>
    </Tabs>
  );
}
