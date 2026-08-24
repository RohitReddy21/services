import { detailRow, detailTable, emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

const CATEGORY_LABEL: Record<string, string> = {
  "air-conditioning": "Air Conditioning",
  refrigeration: "Refrigeration",
};

export function bookingReceivedEmail(input: {
  bookingReference: string;
  categoryId: string;
  equipmentLabel: string;
  date: string;
  timeSlotLabel: string;
  addressLine: string;
}) {
  const subject = `Booking Request Received — ${input.bookingReference}`;
  const html = emailLayout({
    preheader: "We've received your AGS service request.",
    heading: "Booking Request Received",
    bodyHtml: `
      <p>Thanks for booking with AGS. Our team will review your request and contact you to confirm the appointment.</p>
      ${detailTable(
        [
          detailRow("Booking ID", input.bookingReference),
          detailRow("Service", CATEGORY_LABEL[input.categoryId] ?? input.categoryId),
          detailRow("Equipment", input.equipmentLabel),
          detailRow("Requested Date", input.date),
          detailRow("Requested Time", input.timeSlotLabel),
          detailRow("Address", input.addressLine),
        ].join("")
      )}
      <p style="margin-top:16px;">No payment is required at this stage — our team will confirm service details and any applicable charges directly with you.</p>
    `,
    ctaLabel: "View My Booking",
    ctaUrl: `${env.frontendUrl}/account/bookings/${input.bookingReference}`,
  });
  return { subject, html };
}
