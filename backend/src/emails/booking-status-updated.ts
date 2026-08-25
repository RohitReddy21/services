import { detailRow, detailTable, emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

const STATUS_LABELS: Record<string, string> = {
  BOOKING_RECEIVED: "Booking Received",
  CONFIRMED: "Confirmed",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  TECHNICIAN_ARRIVING: "Technician Arriving",
  SERVICE_STARTED: "Service In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function bookingStatusUpdatedEmail(input: {
  bookingReference: string;
  equipmentLabel: string;
  status: string;
}) {
  const statusLabel = STATUS_LABELS[input.status] ?? input.status;
  const subject = `Booking Update — ${input.bookingReference}`;
  const html = emailLayout({
    preheader: `Your AGS booking status changed to ${statusLabel}.`,
    heading: "Booking Status Updated",
    bodyHtml: `
      <p>Your booking status has been updated.</p>
      ${detailTable(
        [
          detailRow("Booking ID", input.bookingReference),
          detailRow("Equipment", input.equipmentLabel),
          detailRow("New Status", statusLabel),
        ].join("")
      )}
      ${
        input.status === "COMPLETED"
          ? '<p style="margin-top:16px;">You can now download a service certificate and leave a review from your account.</p>'
          : ""
      }
    `,
    ctaLabel: "View Booking",
    ctaUrl: `${env.frontendUrl}/account/bookings/${input.bookingReference}`,
  });
  return { subject, html };
}
