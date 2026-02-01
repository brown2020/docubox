import { NextRequest, NextResponse } from "next/server";

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
 * Middleware for Firebase session-based authentication.
 * Replaces Clerk middleware with cookie-based auth check.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie?.value;

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
