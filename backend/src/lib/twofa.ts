import { authenticator } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { generateShortCode } from "./codes";

const ISSUER = "AGS";

// Accept the previous/current/next 30s step (~±30s tolerance) — a real user
// needs a few seconds to read their authenticator app and type the code, so
// a zero-tolerance window would cause spurious failures near the boundary.
authenticator.options = { window: 1 };

export function generateTwoFactorSecret() {
  return authenticator.generateSecret();
}

export function verifyTwoFactorCode(secret: string, code: string) {
  try {
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

export async function buildTwoFactorQrCode(email: string, secret: string) {
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  return { otpauthUrl, qrCodeDataUrl };
}

const BACKUP_CODE_COUNT = 8;

export async function generateBackupCodes() {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, () => generateShortCode(8));
  const hashed = await Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  return { codes, hashed };
}

export async function consumeBackupCode(hashedCodes: string[], candidate: string) {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(candidate.toUpperCase(), hashedCodes[i])) {
      return i;
    }
  }
  return -1;
}
