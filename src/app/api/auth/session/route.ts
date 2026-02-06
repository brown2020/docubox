import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

// Session cookie name
const SESSION_COOKIE_NAME = "__session";

// Session duration: 5 days (in milliseconds)
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000;

/** Cookie options shared between set/clear operations */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * POST /api/auth/session
 * Creates a session cookie from a Firebase ID token.
 *
 * Uses NextResponse.cookies.set() directly on the response object to ensure
 * the Set-Cookie header is always included in the response (cookies() from
 * next/headers can silently fail to propagate in Route Handlers).
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is initialized
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      logger.error("SessionAPI", "Firebase Admin not configured - FIREBASE_PRIVATE_KEY missing");
      return NextResponse.json(
        { error: "Server configuration error", details: "Firebase Admin not configured" },
        { status: 500 }
      );
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    // Build response and set cookie directly on it so the Set-Cookie header
    // is guaranteed to be included in the HTTP response
    const response = NextResponse.json({
      success: true,
      userId: decodedToken.uid,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = (error as { code?: string })?.code;
    logger.error("SessionAPI", "Failed to create session", { message: errorMessage, code: errorCode });
    return NextResponse.json(
      { error: "Failed to create session", details: errorMessage, code: errorCode },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    // Get the session cookie for revocation
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (sessionCookie?.value) {
      // Optionally revoke the session on Firebase side
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value);
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
      } catch {
        // Session might already be invalid, that's ok
      }
    }

    // Build response and clear the cookie directly on the response
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    logger.error("SessionAPI", "Failed to clear session", error);
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/session
 * Verifies the current session and returns user info.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie.value,
      true // Check if revoked
    );

    return NextResponse.json({
      authenticated: true,
      userId: decodedClaims.uid,
      email: decodedClaims.email,
    });
  } catch (error) {
    logger.error("SessionAPI", "Session verification failed", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
