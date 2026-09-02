import { NextResponse, type NextRequest } from "next/server";

// The session cookie set by the backend after login (see backend lib/cookies.ts).
const ACCESS_COOKIE = "ags_at";

/**
 * Gate the authenticated areas on the *presence* of the session cookie only —
 * no call to the backend. The backend runs on a free instance that can take
 * 30–60s to wake from cold, and doing the auth check inside the page's server
 * render meant every "Book a Service" click (and every post-login redirect)
 * waited on that, or timed out and bounced a logged-in user back to /login.
 *
 * This check is instant. Real authorization still happens on the API for every
 * data request and inside the page for the user object — a forged or expired
 * cookie just yields empty data, not access.
 */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(ACCESS_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/book", "/account/:path*", "/technician/:path*"],
};
