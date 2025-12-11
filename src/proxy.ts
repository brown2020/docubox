import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Protected routes configuration for Next.js 16 proxy.
 * These routes require authentication.
 */
const PROTECTED_ROUTES = [
  "/dashboard(.*)",
  "/trash(.*)",
  "/profile(.*)",
  "/payment-attempt(.*)",
  "/payment-success(.*)",
] as const;

/**
 * Public-only routes - redirect authenticated users away.
 */
const PUBLIC_ONLY_ROUTES = ["/loginfinish(.*)"] as const;

const isProtectedRoute = createRouteMatcher([...PROTECTED_ROUTES]);
const isPublicOnlyRoute = createRouteMatcher([...PUBLIC_ONLY_ROUTES]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect signed-in users away from public-only routes
  if (isPublicOnlyRoute(req) && userId) {
    const url = new URL("/dashboard", req.url);
    return Response.redirect(url);
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
