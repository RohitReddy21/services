import { randomBytes } from "crypto";

// Unambiguous uppercase charset — no 0/O or 1/I confusion when read aloud or typed.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortCode(length = 8) {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}
