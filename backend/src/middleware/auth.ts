import type { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "../lib/cookies";
import { verifyAccessToken } from "../lib/jwt";
import { User } from "../models/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      isAdmin?: boolean;
    }
  }
}

/** Attaches `req.userId` if a valid session exists, but never blocks the request. */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (token) {
    const userId = verifyAccessToken(token);
    if (userId) req.userId = userId;
  }
  next();
}

/** Blocks the request with 401 unless a valid session is present. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

/**
 * Blocks with 404 (never 401/403) unless the caller is an authenticated ADMIN —
 * deliberately indistinguishable from a non-existent route for everyone else,
 * so the admin surface stays undiscoverable rather than just "access denied".
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(404).json({ error: "Not found" });
  }
  const user = await User.findById(req.userId);
  if (!user || user.role !== "ADMIN") {
    return res.status(404).json({ error: "Not found" });
  }
  req.isAdmin = true;
  next();
}
