import { detailRow, detailTable, emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

export function bookingRescheduledEmail(input: {
  bookingReference: string;
  equipmentLabel: string;
  previousDate: string;
  previousSlotLabel: string;
  newDate: string;
  newSlotLabel: string;
}) {
  const subject = `Booking Rescheduled — ${input.bookingReference}`;
  const html = emailLayout({
    preheader: "Your AGS appointment has a new date and time.",
    heading: "Booking Rescheduled",
    bodyHtml: `
      <p>Your appointment has been moved to a new date and time.</p>
      ${detailTable(
        [
          detailRow("Booking ID", input.bookingReference),
          detailRow("Equipment", input.equipmentLabel),
          detailRow("Previous slot", `${input.previousDate} — ${input.previousSlotLabel}`),
          detailRow("New slot", `${input.newDate} — ${input.newSlotLabel}`),
        ].join("")
      )}
    `,
    ctaLabel: "View Booking",
    ctaUrl: `${env.frontendUrl}/account/bookings`,
  });
  return { subject, html };
}
