import type { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "../lib/cookies";
import { verifyAccessToken } from "../lib/jwt";
import { User } from "../models/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
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
