import { Router } from "express";
import { Booking } from "../models/Booking";
import { SlotReservation } from "../models/SlotReservation";
import { Notification } from "../models/Notification";
import { attachUser, requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { randomBytes } from "crypto";
import { createBookingSchema, rescheduleSchema } from "../validation/booking";
import { sendEmail } from "../lib/email";
import { bookingReceivedEmail } from "../emails/booking-received";
import { bookingCancelledEmail } from "../emails/booking-cancelled";

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
  res.json(booking);
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
  const { note } = rescheduleSchema.parse(req.body);

  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking || booking.customerId?.toString() !== req.userId) {
    throw new ApiError(404, "Booking not found");
  }

  booking.rescheduleRequested = true;
  booking.rescheduleNote = note;
  await booking.save();

  res.json(booking);
});
