import { User } from "firebase/auth";
import { logger } from "@/lib/logger";

export class SessionCookieError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionCookieError";
  }
}

/**
 * Creates a session cookie by calling the session API, then confirms the
 * server will accept that cookie before the app navigates to a protected page.
 */
export async function createSessionCookie(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ parseError: true }));
      logger.error("session-client", "Session API returned error", errorData);
      const message =
        errorData && typeof errorData.error === "string"
          ? errorData.error
          : "Failed to create session";
      throw new SessionCookieError(message);
    }

    const confirmed = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
    });
    if (!confirmed.ok) {
      throw new SessionCookieError(
        "Signed in, but the server did not keep the session cookie. Stay on this page and try again."
      );
    }
  } catch (error) {
    if (error instanceof SessionCookieError) throw error;
    logger.error("session-client", "Failed to create session cookie", error);
    throw new SessionCookieError("Failed to create session");
  }
}

/**
 * Clears the session cookie by calling the session API.
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
  } catch (error) {
    logger.error("session-client", "Failed to clear session cookie", error);
  }
}
