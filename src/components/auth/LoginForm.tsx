"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { useAuthMethods, useAuth } from "./FirebaseAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { logger } from "@/lib/logger";
import {
  formatFirebaseAuthErrorForLog,
  mapFirebaseAuthError,
} from "@/lib/firebaseAuthErrors";
import { PasswordInput } from "@/components/ui/password-input";
import { isMagicLinkCallback, getStoredEmailForSignIn } from "@/hooks/useFirebaseAuth";
import { LoadingState } from "@/components/common/LoadingState";

type AuthMode = "signin" | "signup" | "forgot" | "forgot-sent";

const MODE_HEADINGS: Record<AuthMode, string> = {
  signin: "Sign in to Docubox",
  signup: "Create your account",
  forgot: "Reset your password",
  "forgot-sent": "Check your email",
};

const MODE_DESCRIPTIONS: Record<AuthMode, string> = {
  signin: "Sign in to access your documents",
  signup: "Store documents and summarize with AI",
  forgot: "We'll email you a link to choose a new password",
  "forgot-sent": "Password reset instructions are on the way",
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const {
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    sendPasswordReset,
    sendMagicLink,
    completeMagicLinkSignIn,
  } = useAuthMethods();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const errorId = useId();

  const redirectAfterSignIn = useCallback(() => {
    const redirectPath =
      typeof window !== "undefined"
        ? sessionStorage.getItem("redirectAfterSignIn")
        : null;
    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterSignIn");
      router.replace(redirectPath);
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  const switchMode = (next: AuthMode) => {
    setError(null);
    setPassword("");
    setMode(next);
  };

  // Handle magic link callback on mount
  useEffect(() => {
    if (isMagicLinkCallback()) {
      const storedEmail = getStoredEmailForSignIn();
      if (storedEmail) {
        setLoading(true);
        completeMagicLinkSignIn(storedEmail)
          .then(() => {
            redirectAfterSignIn();
          })
          .catch((err) => {
            // Expected auth failure — warn only (console.error triggers Next "Console Error" overlay).
      logger.warn(
        "LoginForm",
        `Magic link sign in failed: ${formatFirebaseAuthErrorForLog(err)}`
      );
            setError(
              mapFirebaseAuthError(
                err,
                "Failed to complete sign in. Please try again."
              )
            );
            setLoading(false);
          });
      }
    }
  }, [completeMagicLinkSignIn, redirectAfterSignIn]);

  // Show loading while auth is initializing
  if (!isLoaded) {
    return <LoadingState message="Loading..." />;
  }

  // If already signed in, show a button to go to dashboard
  if (isSignedIn) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <p className="mb-4">You are already signed in.</p>
          <Button onClick={() => router.replace("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      redirectAfterSignIn();
    } catch (err) {
      logger.warn(
        "LoginForm",
        `Google sign in failed: ${formatFirebaseAuthErrorForLog(err)}`
      );
      setError(
        mapFirebaseAuthError(err, "Failed to sign in with Google. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "forgot") {
        await sendPasswordReset(email);
        setMode("forgot-sent");
        return;
      }
      if (mode === "signup") {
        await createAccount(email, password, displayName || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      redirectAfterSignIn();
    } catch (err: unknown) {
      logger.warn(
        "LoginForm",
        `Email auth failed: ${formatFirebaseAuthErrorForLog(err)}`
      );
      const fallback =
        mode === "forgot"
          ? "Could not send reset email. Check the address and try again."
          : mode === "signup"
            ? "Could not create account. Please try again."
            : "Email sign-in failed. Check your email and password.";
      setError(mapFirebaseAuthError(err, fallback));
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      logger.warn(
        "LoginForm",
        `Magic link failed: ${formatFirebaseAuthErrorForLog(err)}`
      );
      setError(
        mapFirebaseAuthError(err, "Failed to send sign in link. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  const submitLabel =
    mode === "signup"
      ? "Create Account"
      : mode === "forgot"
        ? "Send reset link"
        : "Sign In";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          {MODE_HEADINGS[mode]}
        </h1>
        <CardDescription>{MODE_DESCRIPTIONS[mode]}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription id={errorId} role="alert">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {mode !== "forgot" && mode !== "forgot-sent" ? (
          <>
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </>
        ) : null}

        {mode === "forgot-sent" ? (
          <div className="text-center py-4 space-y-4">
            <Mail className="mx-auto h-12 w-12 text-green-500" />
            <p className="font-medium" role="status">
              If an account exists for{" "}
              <strong>{email.trim() || "that address"}</strong>, we sent a password
              reset link. Check your inbox and spam folder.
            </p>
            <Button variant="link" onClick={() => switchMode("signin")}>
              Back to sign in
            </Button>
          </div>
        ) : mode === "forgot" ? (
          <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                  autoComplete="username"
                  aria-describedby={error ? errorId : undefined}
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
                onClick={() => switchMode("signin")}
                className="text-primary underline hover:no-underline"
              >
                Back to sign in
              </button>
            </p>
          </form>
        ) : (
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email & Password</TabsTrigger>
              <TabsTrigger value="magic">Email Link</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
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
                        onChange={(e) => setDisplayName(e.target.value)}
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9"
                      autoComplete="username"
                      aria-describedby={error ? errorId : undefined}
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
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                      className="pl-9"
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      aria-describedby={error ? errorId : undefined}
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
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="text-primary underline hover:no-underline"
                    >
                      Create one
                    </button>
                    {" · "}
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-primary underline hover:no-underline"
                    >
                      Forgot password?
                    </button>
                  </p>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="text-primary underline hover:no-underline"
                    >
                      Sign in
                    </button>
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
                  <Button
                    variant="link"
                    onClick={() => setMagicLinkSent(false)}
                    className="mt-4"
                  >
                    Use a different email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
        )}
      </CardContent>
    </Card>
  );
}
