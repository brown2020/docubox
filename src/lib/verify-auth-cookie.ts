import { adminAuth } from "@/firebase/firebaseAdmin";
import { sessionTokenKind } from "@/lib/session-token";

/**
 * Verifies either a Firebase session cookie or a verified ID token stored as
 * the session. ID tokens are the fallback when the Admin service account
 * cannot mint a session cookie.
 */
export async function verifyAuthCookie(token: string) {
  if (sessionTokenKind(token) === "id") {
    return adminAuth.verifyIdToken(token);
  }

  try {
    return await adminAuth.verifySessionCookie(token, true);
  } catch (error) {
    if (sessionTokenKind(token) === "session") throw error;
    return adminAuth.verifyIdToken(token);
  }
}
