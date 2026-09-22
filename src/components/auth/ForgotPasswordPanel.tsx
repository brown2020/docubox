"use client";

import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  email: string;
  loading: boolean;
  errorId?: string;
  hasError: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToSignIn: () => void;
};

export function ForgotPasswordPanel({
  email,
  loading,
  errorId,
  hasError,
  onEmailChange,
  onSubmit,
  onBackToSignIn,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
      <p className="text-sm text-muted-foreground">
        We&apos;ll email you a link to choose a new password.
      </p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-primary underline hover:no-underline"
        >
          Back to sign in
        </button>
      </p>
    </form>
  );
}

type SentProps = {
  email: string;
  onBackToSignIn: () => void;
};

export function ForgotPasswordSentPanel({ email, onBackToSignIn }: SentProps) {
  return (
    <div className="text-center py-4 space-y-4">
      <Mail className="mx-auto h-12 w-12 text-green-500" />
      <p className="font-medium" role="status">
        If an account exists for{" "}
        <strong>{email.trim() || "that address"}</strong>, we sent a password
        reset link. Check your inbox and spam folder.
      </p>
      <Button variant="link" onClick={onBackToSignIn}>
        Back to sign in
      </Button>
    </div>
  );
}
