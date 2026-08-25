import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { ResetToken } from "../models/ResetToken";
import { Notification } from "../models/Notification";
import {
  signAccessToken,
  verifyAccessToken,
  signTwoFactorPendingToken,
  verifyTwoFactorPendingToken,
} from "../lib/jwt";
import { consumeBackupCode, verifyTwoFactorCode } from "../lib/twofa";
import { generateToken } from "../lib/tokens";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "../lib/cookies";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { sendEmail } from "../lib/email";
import { welcomeEmail } from "../emails/welcome";
import { applyReferralCode, assignReferralCode } from "../lib/referral";
import { passwordResetEmail } from "../emails/password-reset";
import { env } from "../config/env";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validation/auth";

export const authRouter = Router();

function toPublicUser(user: InstanceType<typeof User>) {
  const obj = user.toJSON() as Record<string, unknown>;
  const {
    passwordHash: _passwordHash,
    googleId: _googleId,
    emailVerified: _emailVerified,
    twoFactorSecret: _twoFactorSecret,
    twoFactorBackupCodes: _twoFactorBackupCodes,
    ...rest
  } = obj;
  return rest;
}

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const GOOGLE_STATE_COOKIE = "ags_google_state";
const GOOGLE_RETURN_COOKIE = "ags_google_return";
const GOOGLE_ERROR_RETURN_COOKIE = "ags_google_error_return";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

// Only guards credential-guessing-sensitive endpoints — /me and /refresh are
// called passively on every page load and must stay unthrottled.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

function oauthConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleRedirectUri);
}

function safeReturnPath(value: unknown) {
  if (typeof value !== "string") return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function redirectToFrontend(res: Parameters<typeof setAuthCookies>[0], path: string, error?: string) {
  const url = new URL(safeReturnPath(path), env.frontendUrl);
  if (error) url.searchParams.set("error", error);
  return res.redirect(url.toString());
}

async function issueSession(user: InstanceType<typeof User>, res: Parameters<typeof setAuthCookies>[0]) {
  const accessToken = signAccessToken(user.id);
  const refreshToken = generateToken("rft");
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  setAuthCookies(res, { accessToken, refreshToken });
}

authRouter.post("/register", credentialLimiter, async (req, res) => {
  const { name, email, phone, password, referralCode } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, passwordHash });

  await assignReferralCode(user);
  await applyReferralCode(user, referralCode);

  await Notification.create({
    userId: user._id,
    type: "welcome",
    title: "Welcome to AGS",
    message: "Your account is ready. Book your first service whenever you need us.",
    href: "/book",
  });

  const welcome = welcomeEmail(user.name);
  void sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html, template: "welcome" });

  await issueSession(user, res);
  res.status(201).json({ user: toPublicUser(user) });
});

authRouter.post("/login", credentialLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email: email.toLowerCase() });
  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !isValid) throw new ApiError(401, "Incorrect email or password.");

  if (user.twoFactorEnabled) {
    return res.json({ requiresTwoFactor: true, pendingToken: signTwoFactorPendingToken(user.id) });
  }

  await issueSession(user, res);
  res.json({ user: toPublicUser(user) });
});

const twoFactorLoginSchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().trim().min(1),
});

authRouter.post("/login/2fa", credentialLimiter, async (req, res) => {
  const { pendingToken, code } = twoFactorLoginSchema.parse(req.body);

  const userId = verifyTwoFactorPendingToken(pendingToken);
  if (!userId) throw new ApiError(401, "Your session expired. Please log in again.");

  const user = await User.findById(userId);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new ApiError(401, "Your session expired. Please log in again.");
  }

  if (verifyTwoFactorCode(user.twoFactorSecret, code)) {
    await issueSession(user, res);
    return res.json({ user: toPublicUser(user) });
  }

  const backupIndex = await consumeBackupCode(user.twoFactorBackupCodes, code);
  if (backupIndex >= 0) {
    user.twoFactorBackupCodes.splice(backupIndex, 1);
    await user.save();
    await issueSession(user, res);
    return res.json({ user: toPublicUser(user) });
  }

  throw new ApiError(401, "Invalid code. Check your authenticator app or use a backup code.");
});

authRouter.get("/google", credentialLimiter, (req, res) => {
  const returnTo = safeReturnPath(req.query.redirect);
  const errorReturnTo = safeReturnPath(req.query.errorRedirect);

  if (!oauthConfigured()) {
    return redirectToFrontend(res, errorReturnTo, "google_oauth_unavailable");
  }

  const state = generateToken("gcs");
  res.cookie(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60 * 1000,
  });
  res.cookie(GOOGLE_RETURN_COOKIE, returnTo, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60 * 1000,
  });
  res.cookie(GOOGLE_ERROR_RETURN_COOKIE, errorReturnTo, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60 * 1000,
  });

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", env.googleClientId!);
  authUrl.searchParams.set("redirect_uri", env.googleRedirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  res.redirect(authUrl.toString());
});

authRouter.get("/google/callback", async (req, res) => {
  const returnTo = safeReturnPath(req.cookies?.[GOOGLE_RETURN_COOKIE]);
  const errorReturnTo = safeReturnPath(req.cookies?.[GOOGLE_ERROR_RETURN_COOKIE]);

  res.clearCookie(GOOGLE_STATE_COOKIE, { path: "/api/auth/google" });
  res.clearCookie(GOOGLE_RETURN_COOKIE, { path: "/api/auth/google" });
  res.clearCookie(GOOGLE_ERROR_RETURN_COOKIE, { path: "/api/auth/google" });

  if (!oauthConfigured()) {
    return redirectToFrontend(res, errorReturnTo, "google_oauth_unavailable");
  }

  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  const savedState = req.cookies?.[GOOGLE_STATE_COOKIE];

  if (!code || !state || !savedState || state !== savedState) {
    return redirectToFrontend(res, errorReturnTo, "google_oauth_failed");
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId!,
      client_secret: env.googleClientSecret!,
      redirect_uri: env.googleRedirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
  if (!tokenResponse.ok || !tokens.access_token) {
    return redirectToFrontend(res, errorReturnTo, "google_oauth_failed");
  }

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = (await profileResponse.json()) as GoogleProfile;
  if (!profileResponse.ok || !profile.sub || !profile.email || !profile.email_verified) {
    return redirectToFrontend(res, errorReturnTo, "google_oauth_failed");
  }

  const email = profile.email.toLowerCase();
  let user = await User.findOne({ email });

  if (user) {
    if (user.googleId && user.googleId !== profile.sub) {
      return redirectToFrontend(res, errorReturnTo, "google_oauth_failed");
    }
    if (!user.googleId) user.googleId = profile.sub;
    user.emailVerified = true;
    if (!user.profileImage && profile.picture) user.profileImage = profile.picture;
    await user.save();
  } else {
    const passwordHash = await bcrypt.hash(generateToken("google"), 10);
    user = await User.create({
      name: profile.name?.trim() || email.split("@")[0],
      email,
      phone: "",
      passwordHash,
      googleId: profile.sub,
      emailVerified: true,
      profileImage: profile.picture ?? null,
    });

    await assignReferralCode(user);

    await Notification.create({
      userId: user._id,
      type: "welcome",
      title: "Welcome to AGS",
      message: "Your Google account is connected. Book your first service whenever you need us.",
      href: "/book",
    });

    const welcome = welcomeEmail(user.name);
    void sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html, template: "welcome" });
  }

  await issueSession(user, res);
  return redirectToFrontend(res, returnTo);
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
  clearAuthCookies(res);
  res.json({ ok: true });
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  const record = refreshToken
    ? await RefreshToken.findOneAndDelete({ token: refreshToken, expiresAt: { $gt: new Date() } })
    : null;

  if (!record) {
    clearAuthCookies(res);
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const user = await User.findById(record.userId);
  if (!user) {
    clearAuthCookies(res);
    throw new ApiError(401, "Account not found.");
  }

  const accessToken = signAccessToken(user.id);
  const newRefreshToken = generateToken("rft");
  await RefreshToken.create({
    token: newRefreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });
  res.json({ user: toPublicUser(user) });
});

authRouter.get("/me", async (req, res) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  const userId = token ? verifyAccessToken(token) : null;
  const user = userId ? await User.findById(userId) : null;

  res.json({ user: user ? toPublicUser(user) : null });
});

authRouter.post("/forgot-password", credentialLimiter, async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() });

  const response: { message: string; previewResetUrl?: string } = {
    message: "If an account exists for that email, a reset link has been sent.",
  };

  if (user) {
    const token = generateToken("rst");
    await ResetToken.create({ token, userId: user._id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });

    const reset = passwordResetEmail(token);
    const result = await sendEmail({
      to: user.email,
      subject: reset.subject,
      html: reset.html,
      template: "password-reset",
    });

    // Only surface the link directly in the response when no RESEND_API_KEY
    // is configured (the email was logged, not actually sent) — otherwise
    // this would leak a password-reset link to anyone who calls the endpoint.
    if (result.status === "logged") {
      response.previewResetUrl = `/reset-password/${token}`;
    }
  }

  res.json(response);
});

authRouter.post("/reset-password", credentialLimiter, async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body);

  const record = await ResetToken.findOneAndDelete({ token, expiresAt: { $gt: new Date() } });
  if (!record) throw new ApiError(400, "This reset link is invalid or has expired.");

  const passwordHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(record.userId, { passwordHash });

  res.json({ ok: true });
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(401, "Not authenticated");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Current password is incorrect.");

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ ok: true });
});
