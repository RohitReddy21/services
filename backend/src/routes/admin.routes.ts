import { Router } from "express";
import { z } from "zod";
import { Booking } from "../models/Booking";
import { SupportTicket } from "../models/SupportTicket";
import { Notification } from "../models/Notification";
import { requireAdmin } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { sendEmail } from "../lib/email";
import { bookingStatusUpdatedEmail } from "../emails/booking-status-updated";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const BOOKING_STATUSES = [
  "BOOKING_RECEIVED",
  "CONFIRMED",
  "TECHNICIAN_ASSIGNED",
  "TECHNICIAN_ARRIVING",
  "SERVICE_STARTED",
  "COMPLETED",
  "CANCELLED",
] as const;

adminRouter.get("/bookings", async (req, res) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = typeof status === "string" && status ? { status } : {};
  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ bookings });
});

const statusUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});

adminRouter.patch("/bookings/:reference/status", async (req, res) => {
  const { status } = statusUpdateSchema.parse(req.body);

  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking) throw new ApiError(404, "Booking not found");

  booking.status = status;
  booking.statusHistory.push({ status, at: new Date() });
  await booking.save();

  if (booking.customerId) {
    await Notification.create({
      userId: booking.customerId,
      type: status === "COMPLETED" ? "service_completed" : "status_changed",
      title: "Booking Status Updated",
      message: `${booking.bookingReference} is now ${status.replaceAll("_", " ").toLowerCase()}.`,
      href: `/account/bookings/${booking.bookingReference}`,
    });
  }

  if (booking.customer?.email) {
    const statusEmail = bookingStatusUpdatedEmail({
      bookingReference: booking.bookingReference,
      equipmentLabel: booking.equipmentLabel,
      status,
    });
    void sendEmail({
      to: booking.customer.email,
      subject: statusEmail.subject,
      html: statusEmail.html,
      template: "booking-status-updated",
    });
  }

  res.json(booking);
});

const technicianSchema = z.object({
  technicianName: z.string().trim().nullable(),
  technicianPhone: z.string().trim().nullable().default(null),
});

adminRouter.patch("/bookings/:reference/technician", async (req, res) => {
  const { technicianName, technicianPhone } = technicianSchema.parse(req.body);

  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking) throw new ApiError(404, "Booking not found");

  booking.technicianName = technicianName;
  booking.technicianPhone = technicianPhone;
  await booking.save();

  res.json(booking);
});

adminRouter.get("/support-tickets", async (req, res) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = typeof status === "string" && status ? { status } : {};
  const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ tickets });
});

adminRouter.patch("/support-tickets/:id/resolve", async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status: "RESOLVED" },
    { returnDocument: "after" }
  );
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ ticket });
});
