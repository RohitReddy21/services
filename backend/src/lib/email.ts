import { Resend } from "resend";
import { env } from "../config/env";
import { EmailEvent } from "../models/EmailEvent";

/**
 * Email sending abstraction (Phase 10). When RESEND_API_KEY is set, emails
 * are actually sent via Resend. Without it, the email is logged to the
 * server console and recorded in the email_events collection with
 * status "logged" instead — the same graceful-fallback pattern used for
 * Supabase Storage, so the app is fully exercisable without credentials and
 * starts sending real email the moment a key is added, with no code change.
 */

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  template,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  template: string;
  /** Optional file attachments, e.g. a generated invoice PDF. */
  attachments?: { filename: string; content: Buffer }[];
}) {
  if (!resend) {
    console.log(`\n[email:logged] template="${template}" to="${to}" subject="${subject}"`);
    if (attachments?.length) {
      console.log(
        `[email:logged] with ${attachments.length} attachment(s): ${attachments
          .map((a) => a.filename)
          .join(", ")}`
      );
    }
    console.log(`[email:logged] (RESEND_API_KEY not set — email not actually sent)\n`);
    await EmailEvent.create({ to, subject, template, status: "logged" });
    return { status: "logged" as const };
  }

  try {
    const result = await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject,
      html,
      ...(attachments?.length
        ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })) }
        : {}),
    });

    if (result.error) throw new Error(result.error.message);

    await EmailEvent.create({
      to,
      subject,
      template,
      status: "sent",
      providerId: result.data?.id ?? null,
    });
    return { status: "sent" as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[email:failed] template="${template}" to="${to}":`, message);
    await EmailEvent.create({ to, subject, template, status: "failed", error: message });
    return { status: "failed" as const };
  }
}
