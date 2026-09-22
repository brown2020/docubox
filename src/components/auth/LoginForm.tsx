"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useAuthMethods, useAuth } from "./FirebaseAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";
import {
  formatFirebaseAuthErrorForLog,
  mapFirebaseAuthError,
} from "@/lib/firebaseAuthErrors";
import {
  isMagicLinkCallback,
  getStoredEmailForSignIn,
} from "@/hooks/useFirebaseAuth";
import { LoadingState } from "@/components/common/LoadingState";
import { GoogleIcon } from "./GoogleIcon";
import {
  ForgotPasswordPanel,
  ForgotPasswordSentPanel,
} from "./ForgotPasswordPanel";
import { EmailAuthPanel } from "./EmailAuthPanel";
import {
  type AuthMode,
  MODE_HEADINGS,
  MODE_DESCRIPTIONS,
} from "./authModes";

export type LoginFormProps = {
  /** Initial mode for first-class /login, /signup, /forgot-password routes */
  initialMode?: Exclude<AuthMode, "forgot-sent">;
};

function settleNavigate(path: string) {
  // Hard navigation after session cookie write so middleware/AuthGuard never race.
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
}

export function LoginForm({ initialMode = "signin" }: LoginFormProps) {
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
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
      settleNavigate(redirectPath);
    } else {
      settleNavigate("/dashboard");
    }
  }, []);

  const switchMode = (next: AuthMode) => {
    setError(null);
    setPassword("");
    setMode(next);
  };

  useEffect(() => {
    if (!isMagicLinkCallback()) return;
    const storedEmail = getStoredEmailForSignIn();
    if (!storedEmail) return;

    let cancelled = false;
    setLoading(true);
    completeMagicLinkSignIn(storedEmail)
      .then(() => {
        if (!cancelled) redirectAfterSignIn();
      })
      .catch((err) => {
        if (cancelled) return;
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

    return () => {
      cancelled = true;
    };
  }, [completeMagicLinkSignIn, redirectAfterSignIn]);

  if (!isLoaded) {
    return <LoadingState message="Loading..." />;
  }

  if (isSignedIn) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <p className="mb-4">You are already signed in.</p>
          <Button onClick={() => settleNavigate("/dashboard")}>
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
        mapFirebaseAuthError(
          err,
          "Failed to sign in with Google. Please try again."
        )
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
        mapFirebaseAuthError(
          err,
          "Failed to send sign in link. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const showGoogle = mode === "signin" || mode === "signup";

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

        {showGoogle ? (
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
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
          </>
        ) : null}

        {mode === "forgot-sent" ? (
          <ForgotPasswordSentPanel
            email={email}
            onBackToSignIn={() => switchMode("signin")}
          />
        ) : mode === "forgot" ? (
          <ForgotPasswordPanel
            email={email}
            loading={loading}
            errorId={errorId}
            hasError={!!error}
            onEmailChange={setEmail}
            onSubmit={handleEmailAuth}
            onBackToSignIn={() => switchMode("signin")}
          />
        ) : (
          <EmailAuthPanel
            mode={mode}
            email={email}
            password={password}
            displayName={displayName}
            loading={loading}
            magicLinkSent={magicLinkSent}
            errorId={errorId}
            hasError={!!error}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onDisplayNameChange={setDisplayName}
            onEmailSubmit={handleEmailAuth}
            onMagicSubmit={handleMagicLink}
            onResetMagic={() => setMagicLinkSent(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
