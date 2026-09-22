export type AuthMode = "signin" | "signup" | "forgot" | "forgot-sent";

export const MODE_HEADINGS: Record<AuthMode, string> = {
  signin: "Sign in to Docubox",
  signup: "Create your account",
  forgot: "Reset your password",
  "forgot-sent": "Check your email",
};

export const MODE_DESCRIPTIONS: Record<AuthMode, string> = {
  signin: "Sign in to access your documents",
  signup: "Store documents and summarize with AI",
  forgot: "We'll email you a link to choose a new password",
  "forgot-sent": "Password reset instructions are on the way",
};
