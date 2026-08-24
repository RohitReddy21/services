import { emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

export function passwordResetEmail(token: string) {
  const resetUrl = `${env.frontendUrl}/reset-password/${token}`;
  const subject = "Reset your AGS password";
  const html = emailLayout({
    preheader: "Reset your AGS account password.",
    heading: "Reset Your Password",
    bodyHtml: `<p>We received a request to reset your AGS account password. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
  });
  return { subject, html };
}
