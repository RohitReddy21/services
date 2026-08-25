import type { Response } from "express";
import { env } from "../config/env";

export const ACCESS_COOKIE = "ags_at";
export const REFRESH_COOKIE = "ags_rt";

// The frontend (vercel.app) and backend (onrender.com) are different
// registrable domains in production, making every credentialed fetch a
// cross-site request. SameSite=Lax cookies are never sent on cross-site
// fetch/XHR (only on top-level navigation), so cross-site cookie auth
// requires SameSite=None — which browsers only honor when Secure is also
// set, hence tying both to isProd together. Locally, frontend/backend share
// "localhost" as their registrable domain (only the port differs), so Lax
// works fine there and avoids needing HTTPS in development.
const CROSS_SITE_COOKIE = env.isProd ? ("none" as const) : ("lax" as const);

export function setAuthCookies(
  res: Response,
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: CROSS_SITE_COOKIE,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: CROSS_SITE_COOKIE,
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}
