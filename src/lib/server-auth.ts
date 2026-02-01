import { auth } from "@clerk/nextjs/server";

/**
 * Server-side authentication utilities for server actions.
 * Use these to verify authentication before performing sensitive operations.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized: Please sign in to continue.") {
    super(message);
    this.name = "UnauthorizedError";
  }
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
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  return { userId };
}

/**
 * Requires authentication and returns user ID along with session claims.
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
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  return {
    userId,
    email: sessionClaims?.email as string | undefined,
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
  const { userId } = await auth();
  return userId;
}
