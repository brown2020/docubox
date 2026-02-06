import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";

/**
 * Protected routes configuration.
 * These routes require authentication via session cookie.
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/trash",
  "/profile",
  "/payment-attempt",
  "/payment-success",
] as const;

/**
 * Public-only routes - redirect authenticated users away.
 */
const PUBLIC_ONLY_ROUTES = ["/login", "/loginfinish"] as const;

/**
 * Session cookie name (must match the API route).
 */
const SESSION_COOKIE_NAME = "__session";

/**
 * Check if a path matches any of the protected routes.
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path matches any of the public-only routes.
 */
function isPublicOnlyRoute(pathname: string): boolean {
  return PUBLIC_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Verifies a session cookie with Firebase Admin.
 * Returns true only if the cookie is valid and not expired/revoked.
 */
async function verifySessionCookie(cookieValue: string): Promise<boolean> {
  try {
    await adminAuth.verifySessionCookie(cookieValue, true);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears an invalid session cookie by setting it to empty with maxAge 0.
 */
function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/**
 * Proxy for Firebase session-based authentication (Next.js 16).
 * Validates session cookies server-side and redirects accordingly.
 * Stale or expired cookies are cleared automatically.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session cookie and verify it
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  let isAuthenticated = false;

  if (sessionCookie?.value) {
    isAuthenticated = await verifySessionCookie(sessionCookie.value);

    // If the cookie exists but is invalid/expired, clear it so the user
    // isn't stuck in a redirect loop between /login and /dashboard
    if (!isAuthenticated) {
      // For public-only routes (like /login), clear the stale cookie and let
      // the user through so they can re-authenticate
      if (isPublicOnlyRoute(pathname)) {
        const response = NextResponse.next();
        return clearSessionCookie(response);
      }

      // For protected routes, redirect to login AND clear the stale cookie
      if (isProtectedRoute(pathname)) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        const response = NextResponse.redirect(url);
        return clearSessionCookie(response);
      }

      // For other routes, just clear the cookie and pass through
      const response = NextResponse.next();
      return clearSessionCookie(response);
    }
  }

  // Redirect authenticated users away from public-only routes (like login)
  if (isPublicOnlyRoute(pathname) && isAuthenticated) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const url = new URL("/login", request.url);
    // Store the attempted URL for redirect after login
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
