import { Router } from "express";
import { Types } from "mongoose";
import { Booking } from "../models/Booking";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { SlotReservation } from "../models/SlotReservation";
import { Notification } from "../models/Notification";
import { attachUser, requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { randomBytes } from "crypto";
import { createBookingSchema, rescheduleSchema } from "../validation/booking";
import { isSlotAvailable } from "../lib/slots";
import { sendEmail } from "../lib/email";
import { bookingReceivedEmail } from "../emails/booking-received";
import { bookingCancelledEmail } from "../emails/booking-cancelled";
import { bookingRescheduledEmail } from "../emails/booking-rescheduled";
import { awardLoyaltyPoints } from "../lib/loyalty";
import { streamBookingCertificate } from "../lib/pdf";

const REQUIREMENT_LABELS: Record<string, string> = {
  installation: "Installation",
  repair: "Repair",
  servicing: "Servicing",
  maintenance: "Maintenance",
  replacement: "Replacement",
  diagnostics: "Diagnostics",
  emergency: "Emergency Callout",
  other: "General Service",
};

const CATEGORY_LABELS: Record<string, string> = {
  "air-conditioning": "Air Conditioning",
  refrigeration: "Refrigeration",
  electrical: "Electrical",
};

export const bookingsRouter = Router();

function bookingReference() {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `AGS-${datePart}-${suffix}`;
}

bookingsRouter.post("/", requireAuth, async (req, res) => {
  const { reservationId, data } = createBookingSchema.parse(req.body);

  const reservation = await SlotReservation.findOneAndDelete({
    token: reservationId,
    expiresAt: { $gt: new Date() },
  });
  if (!reservation) {
    throw new ApiError(410, "Your reserved slot has expired. Please select a new time.");
  }

  const now = new Date();
  const booking = await Booking.create({
    bookingReference: bookingReference(),
    customerId: req.userId,
    status: "BOOKING_RECEIVED",
    statusHistory: [{ status: "BOOKING_RECEIVED", at: now }],
    ...data,
  });

  await Notification.create({
    userId: req.userId,
    type: "booking_received",
    title: "Booking Request Received",
    message: `We've received your request (${booking.bookingReference}). Our team will confirm your appointment shortly.`,
    href: `/account/bookings/${booking.bookingReference}`,
  });

  void awardLoyaltyPoints({
    userId: req.userId!,
    amount: 10,
    reason: "booking_created",
    description: `Booked ${data.equipmentLabel} service (${booking.bookingReference})`,
  });

  const addressLine = [data.address.houseNumber, data.address.street, data.address.city, data.address.postcode]
    .filter(Boolean)
    .join(", ");
  const receivedEmail = bookingReceivedEmail({
    bookingReference: booking.bookingReference,
    categoryId: data.categoryId,
    equipmentLabel: data.equipmentLabel,
    date: data.date,
    timeSlotLabel: data.timeSlot.label,
    addressLine,
  });
  void sendEmail({
    to: data.customer.email,
    subject: receivedEmail.subject,
    html: receivedEmail.html,
    template: "booking-received",
  });

  res.status(201).json(booking);
});

bookingsRouter.get("/", attachUser, async (req, res) => {
  const { reference, mine } = req.query;

  if (mine) {
    if (!req.userId) throw new ApiError(401, "Not authenticated");
    const bookings = await Booking.find({ customerId: req.userId }).sort({ createdAt: -1 });
    return res.json({ bookings });
  }

  if (!reference || typeof reference !== "string") {
    throw new ApiError(400, "Missing 'reference' parameter");
  }
  const booking = await Booking.findOne({ bookingReference: reference });
  if (!booking) throw new ApiError(404, "Booking not found");

  // Attach the assigned engineer's public track record so the customer can see
  // who is coming and how they're rated, the way a marketplace app would.
  const engineer = booking.technicianId ? await engineerCard(booking.technicianId) : null;

  res.json({ ...booking.toJSON(), engineer });
});

/** Name, contact and customer rating for an assigned engineer. */
async function engineerCard(technicianId: Types.ObjectId) {
  const [technician, agg, jobsCompleted] = await Promise.all([
    User.findById(technicianId).select("name phone profileImage"),
    Review.aggregate<{ avg: number; count: number }>([
      { $match: { technicianId, deletedAt: null } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Booking.countDocuments({ technicianId, status: "COMPLETED", deletedAt: null }),
  ]);
  if (!technician) return null;

  return {
    name: technician.name,
    phone: technician.phone || null,
    profileImage: technician.profileImage ?? null,
    avgRating: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : null,
    reviewCount: agg[0]?.count ?? 0,
    jobsCompleted,
  };
}

bookingsRouter.get("/:reference/certificate", requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking || booking.customerId?.toString() !== req.userId) {
    throw new ApiError(404, "Booking not found");
  }
  if (booking.status !== "COMPLETED") {
    throw new ApiError(400, "A certificate is only available once a booking is completed.");
  }

  const addressLine = [
    booking.address?.houseNumber,
    booking.address?.street,
    booking.address?.city,
    booking.address?.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  const completedEntry = booking.statusHistory.find((h) => h.status === "COMPLETED");
  const completedDate = (completedEntry?.at ?? booking.updatedAt).toLocaleDateString("en-GB");

  streamBookingCertificate(res, {
    bookingReference: booking.bookingReference,
    issuedAt: new Date(),
    customerName: booking.customer?.fullName ?? "Customer",
    equipmentLabel: booking.equipmentLabel,
    categoryLabel: CATEGORY_LABELS[booking.categoryId] ?? booking.categoryId,
    completedDate,
    timeSlotLabel: booking.timeSlot.label,
    address: addressLine,
    requirementLabel: REQUIREMENT_LABELS[booking.requirement] ?? booking.requirement,
  });
});

bookingsRouter.post("/:reference/cancel", requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking || booking.customerId?.toString() !== req.userId) {
    throw new ApiError(404, "Booking not found");
  }
  if (booking.status !== "CANCELLED" && booking.status !== "COMPLETED") {
    booking.status = "CANCELLED";
    booking.statusHistory.push({ status: "CANCELLED", at: new Date() });
    await booking.save();

    const cancelledEmail = bookingCancelledEmail({
      bookingReference: booking.bookingReference,
      equipmentLabel: booking.equipmentLabel,
    });
    if (booking.customer?.email) {
      void sendEmail({
        to: booking.customer.email,
        subject: cancelledEmail.subject,
        html: cancelledEmail.html,
        template: "booking-cancelled",
      });
    }
  }
  res.json(booking);
});

bookingsRouter.post("/:reference/reschedule", requireAuth, async (req, res) => {
  const { date, timeSlot } = rescheduleSchema.parse(req.body);

  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking || booking.customerId?.toString() !== req.userId) {
    throw new ApiError(404, "Booking not found");
  }
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new ApiError(400, "This booking can no longer be rescheduled.");
  }

  const seed = `${booking.categoryId}::${booking.equipmentId}`;
  const available = await isSlotAvailable(date, timeSlot.id, seed);
  if (!available) throw new ApiError(409, "That slot is no longer available. Please pick another.");

  const previousDate = booking.date;
  const previousSlotLabel = booking.timeSlot.label;

  booking.date = date;
  booking.timeSlot = timeSlot;
  booking.rescheduleRequested = false;
  booking.rescheduleNote = null;
  await booking.save();

  await Notification.create({
    userId: req.userId,
    type: "status_changed",
    title: "Booking Rescheduled",
    message: `${booking.bookingReference} was moved to ${date} (${timeSlot.label}).`,
    href: `/account/bookings/${booking.bookingReference}`,
  });

  if (booking.customer?.email) {
    const rescheduledEmail = bookingRescheduledEmail({
      bookingReference: booking.bookingReference,
      equipmentLabel: booking.equipmentLabel,
      previousDate,
      previousSlotLabel,
      newDate: date,
      newSlotLabel: timeSlot.label,
    });
    void sendEmail({
      to: booking.customer.email,
      subject: rescheduledEmail.subject,
      html: rescheduledEmail.html,
      template: "booking-rescheduled",
    });
  }

  res.json(booking);
});
