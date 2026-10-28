import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import {
  ADMIN_CREDENTIAL_MESSAGE,
  isInvalidAdminCredential,
} from "@/lib/admin-credential-error";
import { logger } from "@/lib/logger";
import { isTrustedSessionOrigin } from "@/lib/session-origin";
import { verifyAuthCookie } from "@/lib/verify-auth-cookie";

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
  if (!isTrustedSessionOrigin(request.headers.get("origin"), request.nextUrl.host)) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 403 });
  }

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
      return NextResponse.json({ error: ADMIN_CREDENTIAL_MESSAGE }, { status: 503 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      if (isInvalidAdminCredential(error)) {
        logger.error("SessionAPI", "Firebase Admin credential rejected while verifying ID token", error);
        return NextResponse.json({ error: ADMIN_CREDENTIAL_MESSAGE }, { status: 503 });
      }
      logger.error("SessionAPI", "Failed to verify ID token", error);
      return NextResponse.json({ error: "Failed to create session" }, { status: 401 });
    }

    // Prefer a Firebase session cookie. If the service account cannot mint one
    // (invalid_grant / account not found), keep the already-verified ID token.
    // The proxy accepts that token via public certificates, so sign-in is not
    // stuck behind a dead Admin key.
    let sessionValue = idToken;
    const tokenTtl = Math.max(
      60,
      (typeof decodedToken.exp === "number" ? decodedToken.exp : 0) - Math.floor(Date.now() / 1000)
    );
    let maxAge = tokenTtl;
    try {
      sessionValue = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION,
      });
      maxAge = SESSION_DURATION / 1000;
    } catch (error) {
      logger.error(
        "SessionAPI",
        isInvalidAdminCredential(error)
          ? "Firebase Admin service account was rejected. Using the verified ID token until FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are replaced."
          : "createSessionCookie failed. Using the verified ID token.",
        error
      );
    }

    const response = NextResponse.json({
      success: true,
      userId: decodedToken.uid,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
      ...COOKIE_OPTIONS,
      maxAge,
    });

    return response;
  } catch (error) {
    logger.error("SessionAPI", "Failed to create session", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie.
 */
export async function DELETE() {
  try {
    // Clear only this browser's cookie. revokeRefreshTokens would sign out
    // every device, and Firebase has no per-session revoke for cookies.
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
    const decodedClaims = await verifyAuthCookie(sessionCookie.value);

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
