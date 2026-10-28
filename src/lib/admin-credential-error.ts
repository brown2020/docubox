/** User-facing text when Google rejects the Admin service account. */
export const ADMIN_CREDENTIAL_MESSAGE =
  "The server could not create a session because its Firebase Admin service account was rejected. Replace FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY with a current key for this Firebase project.";

export function isInvalidAdminCredential(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const record = current as { code?: unknown; message?: unknown; cause?: unknown };
    if (record.code === "app/invalid-credential") return true;
    if (typeof record.message === "string" && record.message.includes("invalid_grant")) {
      return true;
    }
    current = record.cause;
  }
  return false;
}
