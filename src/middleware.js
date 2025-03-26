// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Restrict access to /admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.email !== "admin123@gmail.com") {
      return NextResponse.redirect(new URL("/signIn", request.url));
    }
  }

  // Log page visit
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userEmail = token?.email || "anonymous";

  try {
    const activityData = {
      userEmail,
      action: "page_visit",
      metadata: {
        page: pathname,
        userAgent: request.headers.get("user-agent"),
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Middleware logging page visit:", activityData); // Debug log

    const response = await fetch(`${request.nextUrl.origin}/api/activity/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Middleware failed to log activity:", errorData);
    } else {
      console.log("Middleware logged activity successfully:", await response.json());
    }
  } catch (error) {
    console.error("Error logging page visit in middleware:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};