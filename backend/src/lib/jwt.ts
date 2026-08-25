import jwt from "jsonwebtoken";
import { env } from "../config/env";

const ACCESS_TOKEN_TTL = "15m";
const TWO_FACTOR_PENDING_TTL = "5m";

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: ACCESS_TOKEN_TTL });
}

export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === "object" && typeof payload.sub === "string") {
      return payload.sub;
    }
    return null;
  } catch {
    return null;
  }
}

/** Short-lived token identifying a user who passed password auth but still owes a 2FA code. */
export function signTwoFactorPendingToken(userId: string) {
  return jwt.sign({ sub: userId, purpose: "2fa-pending" }, env.jwtSecret, {
    expiresIn: TWO_FACTOR_PENDING_TTL,
  });
}

export function verifyTwoFactorPendingToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (
      typeof payload === "object" &&
      payload.purpose === "2fa-pending" &&
      typeof payload.sub === "string"
    ) {
      return payload.sub;
    }
    return null;
  } catch {
    return null;
  }
}
