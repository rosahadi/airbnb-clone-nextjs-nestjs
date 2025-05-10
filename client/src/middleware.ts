import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of paths that are public (don't require authentication)
const publicPaths = ["/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get("jwt")?.value;
  const isAuthenticated = !!authToken;

  // Check if the path is NOT public and user is not authenticated
  if (
    !publicPaths.some(
      (path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    ) &&
    !isAuthenticated
  ) {
    // Redirect to home page if trying to access protected path without auth
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure middleware to match specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - static files (/_next/*, /favicon.ico, etc.)
     * - public files (/public/*)
     */
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
