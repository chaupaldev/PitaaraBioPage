import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Middleware function
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // If authenticated, redirect away from auth pages to dashboard
  if (
    token &&
    (pathname.startsWith("/sign-in") ||
      pathname === "/"
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If NOT authenticated and trying to access protected routes, redirect to /sign-in
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url)); // Redirect to login
  }

  // Allow other requests to proceed
  return NextResponse.next();
}

// Paths where we want to run middleware
export const config = {
  matcher: [
    "/sign-in",
    "/sign-in/:path*",
    "/",
    "/dashboard/:path*",
  ],
};
