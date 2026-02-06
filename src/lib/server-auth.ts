import { cookies, headers } from "next/headers";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { logger } from "@/lib/logger";

/**
 * Session cookie name (must match the API route and middleware).
 */
const SESSION_COOKIE_NAME = "__session";

/**
 * Server-side authentication utilities for server actions and API routes.
 * Uses Firebase Admin SDK to verify session cookies or ID tokens.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized: Please sign in to continue.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Gets the Firebase decoded token from session cookie or Authorization header.
 * Returns null if no valid auth is found.
 */
async function getDecodedToken() {
  // First, try session cookie (for server actions and page requests)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    try {
      return await adminAuth.verifySessionCookie(sessionCookie.value, true);
    } catch {
      logger.warn("server-auth", "Session cookie verification failed");
      // Cookie might be expired or invalid, continue to check header
    }
  }

  // Second, try Authorization header (for API calls with ID token)
  const headerStore = await headers();
  const authHeader = headerStore.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.substring(7);
    try {
      return await adminAuth.verifyIdToken(idToken);
    } catch {
      logger.warn("server-auth", "ID token verification failed");
    }
  }

  return null;
}

/**
 * Requires authentication and returns the user ID.
 * Throws UnauthorizedError if not authenticated.
 *
 * @example
 * export async function myServerAction() {
 *   const { userId } = await requireAuth();
 *   // ... perform action with userId
 * }
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const decodedToken = await getDecodedToken();

  if (!decodedToken) {
    throw new UnauthorizedError();
  }

  return { userId: decodedToken.uid };
}

/**
 * Requires authentication and returns user ID along with email.
 * Throws UnauthorizedError if not authenticated.
 *
 * @example
 * export async function myServerAction() {
 *   const { userId, email } = await requireAuthWithClaims();
 *   // ... perform action with userId and email
 * }
 */
export async function requireAuthWithClaims(): Promise<{
  userId: string;
  email: string | undefined;
}> {
  const decodedToken = await getDecodedToken();

  if (!decodedToken) {
    throw new UnauthorizedError();
  }

  return {
    userId: decodedToken.uid,
    email: decodedToken.email,
  };
}

/**
 * Optionally gets the user ID without throwing.
 * Returns null if not authenticated.
 *
 * @example
 * export async function myServerAction() {
 *   const userId = await getOptionalAuth();
 *   if (!userId) {
 *     // Handle unauthenticated case
 *   }
 * }
 */
export async function getOptionalAuth(): Promise<string | null> {
  const decodedToken = await getDecodedToken();
  return decodedToken?.uid ?? null;
}
