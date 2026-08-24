import type { Response } from "express";
import { env } from "../config/env";

export const ACCESS_COOKIE = "ags_at";
export const REFRESH_COOKIE = "ags_rt";

export function setAuthCookies(
  res: Response,
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}
