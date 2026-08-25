import { Router } from "express";
import { z } from "zod";
import { Booking } from "../models/Booking";
import { SupportTicket } from "../models/SupportTicket";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { Subscription } from "../models/Subscription";
import { Review } from "../models/Review";
import { Coupon } from "../models/Coupon";
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

// ---------------- Users ----------------

adminRouter.get("/users", async (req, res) => {
  const { search } = req.query;
  const filter: Record<string, unknown> =
    typeof search === "string" && search
      ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
      : {};
  const users = await User.find(filter)
    .select("-passwordHash -twoFactorSecret -twoFactorBackupCodes")
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ users });
});

// ---------------- Subscriptions (Care Plans) ----------------

adminRouter.get("/subscriptions", async (req, res) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = typeof status === "string" && status ? { status } : {};
  const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 }).limit(300);
  res.json({ subscriptions });
});

// ---------------- Reviews ----------------

adminRouter.get("/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(300);
  res.json({ reviews });
});

// ---------------- Coupons ----------------

adminRouter.get("/coupons", async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
});

const couponSchema = z.object({
  code: z.string().trim().min(3).max(24),
  description: z.string().trim().default(""),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().positive(),
  expiresAt: z.string().trim().nullable().default(null),
  maxRedemptions: z.number().int().positive().nullable().default(null),
});

adminRouter.post("/coupons", async (req, res) => {
  const input = couponSchema.parse(req.body);

  const existing = await Coupon.findOne({ code: input.code.toUpperCase() });
  if (existing) throw new ApiError(409, "A coupon with this code already exists.");

  const coupon = await Coupon.create({
    ...input,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  });
  res.status(201).json({ coupon });
});

const couponPatchSchema = z.object({
  active: z.boolean().optional(),
  description: z.string().trim().optional(),
  discountValue: z.number().positive().optional(),
  expiresAt: z.string().trim().nullable().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
});

adminRouter.patch("/coupons/:id", async (req, res) => {
  const patch = couponPatchSchema.parse(req.body);

  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  if (patch.active !== undefined) coupon.active = patch.active;
  if (patch.description !== undefined) coupon.description = patch.description;
  if (patch.discountValue !== undefined) coupon.discountValue = patch.discountValue;
  if (patch.expiresAt !== undefined) coupon.expiresAt = patch.expiresAt ? new Date(patch.expiresAt) : null;
  if (patch.maxRedemptions !== undefined) coupon.maxRedemptions = patch.maxRedemptions;
  await coupon.save();

  res.json({ coupon });
});

adminRouter.delete("/coupons/:id", async (req, res) => {
  const result = await Coupon.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) throw new ApiError(404, "Coupon not found");
  res.json({ ok: true });
});
