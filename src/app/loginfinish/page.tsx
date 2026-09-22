import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login Finish",
  description: "Complete Docubox sign-in.",
};

/**
 * Legacy route from Clerk auth era. Firebase Auth doesn't use this flow.
 * Kept as a redirect to avoid 404s for old bookmarks.
 */
export default function LoginFinishPage() {
  redirect("/login");
}
