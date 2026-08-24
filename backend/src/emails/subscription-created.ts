import { detailRow, detailTable, emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

export function subscriptionCreatedEmail(input: {
  planName: string;
  frequency: string;
  equipmentLabel: string;
}) {
  const subject = `You're subscribed to ${input.planName}`;
  const html = emailLayout({
    preheader: "Your AGS Care Plan is confirmed.",
    heading: "Care Plan Subscribed",
    bodyHtml: `
      <p>You're now subscribed to an AGS Care Plan. Our team will be in touch to confirm your first visit.</p>
      ${detailTable(
        [
          detailRow("Plan", input.planName),
          detailRow("Frequency", input.frequency),
          detailRow("Equipment", input.equipmentLabel),
        ].join("")
      )}
    `,
    ctaLabel: "Manage My Plans",
    ctaUrl: `${env.frontendUrl}/account/subscriptions`,
  });
  return { subject, html };
}
