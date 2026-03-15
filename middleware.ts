// ─────────────────────────────────────────────────────────────
//  Vaulte — Next.js Edge Middleware
//  Runs before every request to /dashboard/* at the edge
//  (no Redis — cookie presence check only; DashboardLayout
//  does full Redis session validation on page load).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const session = req.cookies.get("vaulte_session");
    if (!session?.value) {
      // No session cookie → redirect to login, preserve intended destination
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on dashboard routes — skip _next/static, api, etc.
  matcher: ["/dashboard/:path*"],
};
