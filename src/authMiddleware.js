// middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const userType = req.nextAuth.token?.userType?.toLowerCase();

    // Define route access rules based on userType
    const routeAccess = {
      "/dashboard/admin": "admin",
      "/dashboard/student": "student",
      "/dashboard/teacher": "teacher",
      "/dashboard/moderator": "moderator",
    };

    // Check if the current path matches a protected route
    const matchedRoute = Object.keys(routeAccess).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      // If user is not authenticated, redirect to sign-in
      if (!req.nextAuth.token) {
        return NextResponse.redirect(new URL("/signIn", req.url));
      }

      // Check if the userType matches the required type for the route
      const requiredUserType = routeAccess[matchedRoute];
      if (userType !== requiredUserType) {
        // Redirect to the unauthorized page
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Ensure the user is authenticated
    },
  }
);

// Define which routes the middleware should apply to
export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/dashboard/student/:path*",
    "/dashboard/teacher/:path*",
    "/dashboard/moderator/:path*",
  ],
};