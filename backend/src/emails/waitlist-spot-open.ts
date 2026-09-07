import { detailRow, detailTable, emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

export function waitlistSpotOpenEmail(input: {
  date: string;
  slotLabel: string;
  equipmentLabel: string;
}) {
  const subject = `A slot just opened up — ${input.date}`;
  const html = emailLayout({
    preheader: "A spot you were waiting for is now available.",
    heading: "Good news — a slot opened up",
    bodyHtml: `
      <p>A time slot you were waitlisted for is now available. Book it before it's gone.</p>
      ${detailTable(
        [
          detailRow("Date", input.date),
          detailRow("Time", input.slotLabel),
          detailRow("Service", input.equipmentLabel),
        ].join("")
      )}
      <p style="margin-top:16px;">Slots are first-come, first-served, so it's worth booking soon.</p>
    `,
    ctaLabel: "Book This Slot",
    ctaUrl: `${env.frontendUrl}/book`,
  });
  return { subject, html };
}
