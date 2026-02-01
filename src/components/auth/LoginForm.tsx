"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthMethods, useAuth } from "./FirebaseAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { logger } from "@/lib/logger";
import { isMagicLinkCallback, getStoredEmailForSignIn } from "@/hooks/useFirebaseAuth";
import { LoadingState } from "@/components/common/LoadingState";

// Google icon SVG
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
  const { signInWithGoogle, signInWithEmail, createAccount, sendMagicLink, completeMagicLinkSignIn } = useAuthMethods();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const redirectAfterSignIn = useCallback(() => {
    const redirectPath = typeof window !== "undefined"
      ? sessionStorage.getItem("redirectAfterSignIn")
      : null;
    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterSignIn");
      // Use replace to avoid back-button issues
      router.replace(redirectPath);
    } else {
      // Use window.location for a full page navigation to ensure cookies are sent
      window.location.href = "/dashboard";
    }
  }, [router]);

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
            logger.error("LoginForm", "Magic link sign in failed", err);
            setError("Failed to complete sign in. Please try again.");
            setLoading(false);
          });
      }
    }
  }, [completeMagicLinkSignIn, redirectAfterSignIn]);

  // Redirect if already signed in (using useEffect to avoid setState during render)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      redirectAfterSignIn();
    }
  }, [isLoaded, isSignedIn, redirectAfterSignIn]);

  // Show loading while checking auth or if already signed in (will redirect)
  if (!isLoaded || isSignedIn) {
    return <LoadingState message="Loading..." />;
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      redirectAfterSignIn();
    } catch (err) {
      logger.error("LoginForm", "Google sign in failed", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createAccount(email, password, displayName || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      redirectAfterSignIn();
    } catch (err: unknown) {
      logger.error("LoginForm", "Email auth failed", err);
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      if (errorMessage.includes("user-not-found") || errorMessage.includes("wrong-password")) {
        setError("Invalid email or password.");
      } else if (errorMessage.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (errorMessage.includes("weak-password")) {
        setError("Password should be at least 6 characters.");
      } else {
        setError(isSignUp ? "Failed to create account." : "Failed to sign in.");
      }
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
      logger.error("LoginForm", "Magic link failed", err);
      setError("Failed to send sign in link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Docubox</CardTitle>
        <CardDescription>Sign in to access your documents</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Google Sign In */}
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

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email & Password</TabsTrigger>
            <TabsTrigger value="magic">Email Link</TabsTrigger>
          </TabsList>

          {/* Email/Password Tab */}
          <TabsContent value="email">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary underline hover:no-underline"
                >
                  {isSignUp ? "Sign in" : "Create one"}
                </button>
              </p>
            </form>
          </TabsContent>

          {/* Magic Link Tab */}
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
      </CardContent>
    </Card>
  );
}
