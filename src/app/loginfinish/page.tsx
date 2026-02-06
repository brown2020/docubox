import { redirect } from "next/navigation";

/**
 * Legacy route from Clerk auth era. Firebase Auth doesn't use this flow.
 * Kept as a redirect to avoid 404s for old bookmarks.
 */
export default function LoginFinishPage() {
  redirect("/login");
}
