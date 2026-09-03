import { emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

/**
 * Sent once a visit is completed, asking the customer to rate the engineer who
 * attended. Deep-links straight to the booking so they can rate in two taps.
 */
export function reviewRequestEmail({
  bookingReference,
  equipmentLabel,
  technicianName,
}: {
  bookingReference: string;
  equipmentLabel: string;
  technicianName?: string | null;
}) {
  const who = technicianName ? `<strong>${technicianName}</strong>` : "the engineer who attended";
  const subject = `How did we do? (${bookingReference})`;
  const html = emailLayout({
    preheader: "Rate your recent AGS visit.",
    heading: "How did we do?",
    bodyHtml: `<p>Your ${equipmentLabel} visit is complete. Let us know how ${who} got on — it takes a few seconds and helps us keep standards high.</p>`,
    ctaLabel: "Rate this visit",
    ctaUrl: `${env.frontendUrl}/account/bookings/${bookingReference}`,
  });
  return { subject, html };
}
