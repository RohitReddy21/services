import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import {
  buildTwoFactorQrCode,
  generateBackupCodes,
  generateTwoFactorSecret,
  verifyTwoFactorCode,
} from "../lib/twofa";

export const twoFactorRouter = Router();
twoFactorRouter.use(requireAuth);

twoFactorRouter.post("/setup", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.twoFactorEnabled) throw new ApiError(400, "Two-factor authentication is already enabled.");

  const secret = generateTwoFactorSecret();
  user.twoFactorSecret = secret;
  await user.save();

  const { qrCodeDataUrl } = await buildTwoFactorQrCode(user.email, secret);
  res.json({ qrCodeDataUrl, secret });
});

const enableSchema = z.object({ code: z.string().trim().length(6) });

twoFactorRouter.post("/enable", async (req, res) => {
  const { code } = enableSchema.parse(req.body);

  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.twoFactorSecret) throw new ApiError(400, "Start setup before enabling two-factor authentication.");

  if (!verifyTwoFactorCode(user.twoFactorSecret, code)) {
    throw new ApiError(400, "That code didn't match. Check your authenticator app and try again.");
  }

  const { codes, hashed } = await generateBackupCodes();
  user.twoFactorEnabled = true;
  user.twoFactorBackupCodes = hashed;
  await user.save();

  res.json({ backupCodes: codes });
});

const disableSchema = z.object({ password: z.string().min(1) });

twoFactorRouter.post("/disable", async (req, res) => {
  const { password } = disableSchema.parse(req.body);

  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Incorrect password.");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorBackupCodes = [];
  await user.save();

  res.json({ ok: true });
});
