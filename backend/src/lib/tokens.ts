import { randomBytes } from "crypto";

export function generateToken(prefix: string) {
  return `${prefix}_${Date.now()}_${randomBytes(12).toString("hex")}`;
}
