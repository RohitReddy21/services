import { detailRow, detailTable, emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

export function bookingCancelledEmail(input: { bookingReference: string; equipmentLabel: string }) {
  const subject = `Booking Cancelled — ${input.bookingReference}`;
  const html = emailLayout({
    preheader: "Your AGS booking has been cancelled.",
    heading: "Booking Cancelled",
    bodyHtml: `
      <p>This confirms your booking has been cancelled as requested.</p>
      ${detailTable(
        [detailRow("Booking ID", input.bookingReference), detailRow("Equipment", input.equipmentLabel)].join("")
      )}
      <p style="margin-top:16px;">Need to book a new service? We're happy to help whenever you're ready.</p>
    `,
    ctaLabel: "Book a Service",
    ctaUrl: `${env.frontendUrl}/book`,
  });
  return { subject, html };
}
