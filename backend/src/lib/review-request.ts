import type { Types } from "mongoose";
import { Notification } from "../models/Notification";
import { Review } from "../models/Review";
import { sendEmail } from "./email";
import { reviewRequestEmail } from "../emails/review-request";

type CompletedBooking = {
  bookingReference: string;
  equipmentLabel: string;
  customerId?: Types.ObjectId | null;
  technicianName?: string | null;
  customer?: { email?: string | null } | null;
};

/**
 * Asks the customer to rate the engineer once a visit is completed. Called
 * from both places a job can be closed (the engineer's portal and the admin
 * console), and safe to call twice — it skips if they've already reviewed.
 */
export async function requestReview(booking: CompletedBooking) {
  try {
    const alreadyReviewed = await Review.exists({
      bookingReference: booking.bookingReference,
      deletedAt: null,
    });
    if (alreadyReviewed) return;

    if (booking.customerId) {
      await Notification.create({
        userId: booking.customerId,
        type: "review_request",
        title: "How did we do?",
        message: `Rate your ${booking.equipmentLabel} visit${
          booking.technicianName ? ` with ${booking.technicianName}` : ""
        }.`,
        href: `/account/bookings/${booking.bookingReference}`,
      });
    }

    if (booking.customer?.email) {
      const email = reviewRequestEmail({
        bookingReference: booking.bookingReference,
        equipmentLabel: booking.equipmentLabel,
        technicianName: booking.technicianName,
      });
      await sendEmail({
        to: booking.customer.email,
        subject: email.subject,
        html: email.html,
        template: "review-request",
      });
    }
  } catch (err) {
    // Never let a review nudge fail the job completion itself.
    console.error("[review-request] failed:", err);
  }
}
