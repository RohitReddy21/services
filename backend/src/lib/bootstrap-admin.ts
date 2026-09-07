import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { User } from "../models/User";
import { assignReferralCode } from "./referral";

/**
 * One-time admin bootstrap for fresh deployments with no accounts yet. Only
 * ever creates — never overwrites an existing account's password or role —
 * so INITIAL_ADMIN_EMAIL/PASSWORD can stay set in the environment permanently
 * without silently reverting a password someone changed later in the app.
 */
export async function bootstrapInitialAdmin() {
  const { initialAdminEmail, initialAdminPassword, initialAdminName } = env;
  if (!initialAdminEmail || !initialAdminPassword) return;

  const email = initialAdminEmail.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(initialAdminPassword, 10);
  const user = await User.create({
    name: initialAdminName,
    email,
    passwordHash,
    role: "ADMIN",
    emailVerified: true,
  });
  await assignReferralCode(user);

  console.log(`[bootstrap] created initial admin account: ${email}`);
}
