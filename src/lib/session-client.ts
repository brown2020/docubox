import { User } from "firebase/auth";
import { logger } from "@/lib/logger";

/**
 * Creates a session cookie by calling the session API.
 * Returns true if successful, false otherwise.
 */
export async function createSessionCookie(user: User): Promise<boolean> {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ parseError: true }));
      logger.error("session-client", "Session API returned error", errorData);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("session-client", "Failed to create session cookie", error);
    return false;
  }
}

/**
 * Clears the session cookie by calling the session API.
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch (error) {
    logger.error("session-client", "Failed to clear session cookie", error);
  }
}
