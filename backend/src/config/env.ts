import "dotenv/config";

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

function csv(value?: string) {
  return (value ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
}

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const defaultCorsOrigins = [
  "http://localhost:3000",
  "https://frontend-silk-seven-87.vercel.app",
  "https://agsrefrigeration.uk",
  "https://www.agsrefrigeration.uk",
];

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  mongodbUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/ags_platform"),
  // Always used as the connection's dbName, overriding whatever (or nothing) the
  // URI specifies — keeps this app isolated from other local projects sharing
  // the same MongoDB host/URI (e.g. a machine-wide MONGODB_URI env var).
  mongodbDbName: process.env.MONGODB_DB_NAME ?? "ags_platform",
  jwtSecret: required(
    "JWT_SECRET",
    process.env.NODE_ENV === "production" ? undefined : "ags-dev-only-insecure-secret"
  ),
  corsOrigins: Array.from(
    new Set([...csv(process.env.CORS_ORIGINS), normalizeOrigin(frontendUrl), ...defaultCorsOrigins])
  ),

  // Phase 9 — Supabase Storage. Falls back to local disk when unset (see lib/storage.ts).
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  // Base URL this server is reachable at, used to build absolute URLs for locally-stored files.
  publicUrl: process.env.PUBLIC_URL ?? `http://localhost:${Number(process.env.PORT ?? 4000)}`,

  // Phase 10 — Resend email. Falls back to console logging when unset (see lib/email.ts).
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "AGS <onboarding@resend.dev>",
  frontendUrl,

  // Company-wide cap on how many jobs can be booked into the same date+slot.
  maxJobsPerSlot: Number(process.env.MAX_JOBS_PER_SLOT ?? 3),

  // One-time admin bootstrap — if set and no account with this email exists yet,
  // the server creates it with the ADMIN role on startup. Never overwrites an
  // existing account, so it's safe to leave these set permanently. See
  // lib/bootstrap-admin.ts.
  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL,
  initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD,
  initialAdminName: process.env.INITIAL_ADMIN_NAME ?? "Admin",

  // Google OAuth sign-in/sign-up. Leave unset to hide/disable the live callback flow.
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.PUBLIC_URL ?? `http://localhost:${Number(process.env.PORT ?? 4000)}`}/api/auth/google/callback`,
};
