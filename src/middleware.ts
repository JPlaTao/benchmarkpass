import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Lightweight auth for middleware - no Prisma dependency
const { auth: middlewareAuth } = NextAuth(authConfig);

export default middlewareAuth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Allow auth pages and landing page
  if (pathname.startsWith("/auth") || pathname === "/") return;

  // Allow static files and all API routes (they handle auth themselves)
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return;

  // Protect all other routes
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Role-based routing
  const role = (user as any)?.role;

  if (pathname.startsWith("/parent") && role !== "PARENT") {
    return NextResponse.redirect(new URL("/child/dashboard", req.url));
  }

  if (pathname.startsWith("/child") && role !== "CHILD") {
    return NextResponse.redirect(new URL("/parent/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
