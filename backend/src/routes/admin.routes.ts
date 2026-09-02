import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Booking } from "../models/Booking";
import { SupportTicket } from "../models/SupportTicket";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { Subscription } from "../models/Subscription";
import { Review } from "../models/Review";
import { Coupon } from "../models/Coupon";
import { requireAdmin } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { assignReferralCode } from "../lib/referral";
import { sendEmail } from "../lib/email";
import { bookingStatusUpdatedEmail } from "../emails/booking-status-updated";
import { subscriptionInvoiceEmail } from "../emails/subscription-invoice";
import { renderSubscriptionInvoice, streamSubscriptionInvoice } from "../lib/pdf";
import { buildSubscriptionInvoiceData } from "../lib/invoice";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

// Every list endpoint hides soft-deleted records unless `?includeArchived=1`.
const NOT_DELETED = { deletedAt: null } as const;
function archiveFilter(req: { query: Record<string, unknown> }) {
  const raw = req.query.includeArchived;
  const includeArchived = raw === "1" || raw === "true";
  return includeArchived ? {} : { ...NOT_DELETED };
}

const BOOKING_STATUSES = [
  "BOOKING_RECEIVED",
  "CONFIRMED",
  "TECHNICIAN_ASSIGNED",
  "TECHNICIAN_ARRIVING",
  "SERVICE_STARTED",
  "COMPLETED",
  "CANCELLED",
] as const;

const CATEGORY_IDS = ["air-conditioning", "refrigeration", "electrical"] as const;
const REQUIREMENTS = [
  "installation",
  "repair",
  "servicing",
  "maintenance",
  "replacement",
  "diagnostics",
  "emergency",
  "other",
] as const;
const SUBSCRIPTION_STATUSES = ["ACTIVE", "PAUSED", "CANCELLED"] as const;
const FREQUENCIES = ["monthly", "annual", "bi-annual", "quarterly", "quarterly-bundle"] as const;
const SUPPORT_CATEGORIES = [
  "booking_help",
  "reschedule_help",
  "cancellation_help",
  "service_questions",
  "technical_questions",
  "general_enquiry",
] as const;

const MONTHS_PER_VISIT: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  "quarterly-bundle": 3,
  "bi-annual": 6,
  annual: 12,
};
function computeNextVisitDate(frequency: string, from: Date) {
  const next = new Date(from);
  next.setMonth(next.getMonth() + (MONTHS_PER_VISIT[frequency] ?? 12));
  return next;
}

function bookingReference() {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `AGS-${datePart}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ==================================================================
// Overview
// ==================================================================

adminRouter.get("/stats", async (_req, res) => {
  const [
    bookingsTotal,
    bookingsByStatus,
    subs,
    ticketsOpen,
    ticketsTotal,
    usersTotal,
    admins,
    reviewAgg,
    couponsActive,
    couponsTotal,
    recentBookings,
    openTickets,
  ] = await Promise.all([
    Booking.countDocuments({ ...NOT_DELETED }),
    Booking.aggregate<{ _id: string; count: number }>([
      { $match: { deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Subscription.find({ ...NOT_DELETED }).select("status price createdAt planName").lean(),
    SupportTicket.countDocuments({ status: "OPEN", ...NOT_DELETED }),
    SupportTicket.countDocuments({ ...NOT_DELETED }),
    User.countDocuments({ ...NOT_DELETED }),
    User.countDocuments({ role: "ADMIN", ...NOT_DELETED }),
    Review.aggregate<{ avg: number; count: number }>([
      { $match: { deletedAt: null } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Coupon.countDocuments({ active: true }),
    Coupon.countDocuments({}),
    Booking.find({ ...NOT_DELETED }).sort({ createdAt: -1 }).limit(5),
    SupportTicket.find({ status: "OPEN", ...NOT_DELETED }).sort({ createdAt: -1 }).limit(5),
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of bookingsByStatus) byStatus[row._id] = row.count;

  let active = 0;
  let paused = 0;
  let cancelled = 0;
  let monthlyRevenue = 0;
  for (const s of subs) {
    if (s.status === "ACTIVE") {
      active += 1;
      const amount = s.price?.amount ?? 0;
      const months = s.price?.billingCycleMonths ?? 1;
      monthlyRevenue += months > 0 ? amount / months : amount;
    } else if (s.status === "PAUSED") {
      paused += 1;
    } else if (s.status === "CANCELLED") {
      cancelled += 1;
    }
  }

  res.json({
    bookings: { total: bookingsTotal, byStatus },
    subscriptions: {
      active,
      paused,
      cancelled,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    },
    tickets: { open: ticketsOpen, total: ticketsTotal },
    users: { total: usersTotal, admins },
    reviews: {
      count: reviewAgg[0]?.count ?? 0,
      avgRating: reviewAgg[0]?.avg ? Math.round(reviewAgg[0].avg * 10) / 10 : 0,
    },
    coupons: { active: couponsActive, total: couponsTotal },
    recentBookings,
    openTickets,
  });
});

// ==================================================================
// Bookings
// ==================================================================

adminRouter.get("/bookings", async (req, res) => {
  const { status, search } = req.query;
  const filter: Record<string, unknown> = { ...archiveFilter(req) };
  if (typeof status === "string" && status) filter.status = status;
  if (typeof search === "string" && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { bookingReference: rx },
      { "customer.fullName": rx },
      { "customer.email": rx },
      { equipmentLabel: rx },
    ];
  }
  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ bookings });
});

const addressSchema = z.object({
  houseNumber: z.string().trim().min(1),
  street: z.string().trim().min(1),
  city: z.string().trim().min(1),
  postcode: z.string().trim().min(1),
  instructions: z.string().trim().default(""),
});

const timeSlotSchema = z.object({
  id: z.string().trim().min(1).default("custom"),
  label: z.string().trim().min(1),
  start: z.string().trim().min(1),
  end: z.string().trim().min(1),
});

const customerSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6),
  preferredContact: z.enum(["phone", "email", "sms"]).default("phone"),
});

const adminCreateBookingSchema = z.object({
  customerId: z.string().trim().nullable().default(null),
  categoryId: z.enum(CATEGORY_IDS),
  equipmentId: z.string().trim().min(1),
  equipmentLabel: z.string().trim().min(1),
  requirement: z.enum(REQUIREMENTS),
  description: z.string().trim().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeSlot: timeSlotSchema,
  status: z.enum(BOOKING_STATUSES).default("BOOKING_RECEIVED"),
  customer: customerSchema,
  address: addressSchema,
  technicianName: z.string().trim().nullable().default(null),
  technicianPhone: z.string().trim().nullable().default(null),
});

adminRouter.post("/bookings", async (req, res) => {
  const input = adminCreateBookingSchema.parse(req.body);

  if (input.customerId) {
    const exists = await User.exists({ _id: input.customerId });
    if (!exists) throw new ApiError(400, "That customer account no longer exists.");
  }

  const now = new Date();
  const booking = await Booking.create({
    bookingReference: bookingReference(),
    customerId: input.customerId,
    status: input.status,
    statusHistory: [{ status: input.status, at: now }],
    categoryId: input.categoryId,
    equipmentId: input.equipmentId,
    equipmentLabel: input.equipmentLabel,
    requirement: input.requirement,
    description: input.description,
    photos: [],
    date: input.date,
    timeSlot: input.timeSlot,
    customer: input.customer,
    address: input.address,
    technicianName: input.technicianName,
    technicianPhone: input.technicianPhone,
  });

  if (input.customerId) {
    await Notification.create({
      userId: input.customerId,
      type: "booking_received",
      title: "Booking Created",
      message: `A booking (${booking.bookingReference}) was created on your account by our team.`,
      href: `/account/bookings/${booking.bookingReference}`,
    });
  }

  res.status(201).json(booking);
});

const adminUpdateBookingSchema = z
  .object({
    categoryId: z.enum(CATEGORY_IDS),
    equipmentId: z.string().trim().min(1),
    equipmentLabel: z.string().trim().min(1),
    requirement: z.enum(REQUIREMENTS),
    description: z.string().trim(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlot: timeSlotSchema,
    customer: customerSchema,
    address: addressSchema,
    technicianName: z.string().trim().nullable(),
    technicianPhone: z.string().trim().nullable(),
  })
  .partial();

adminRouter.patch("/bookings/:reference", async (req, res) => {
  const patch = adminUpdateBookingSchema.parse(req.body);
  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking) throw new ApiError(404, "Booking not found");

  Object.assign(booking, patch);
  await booking.save();
  res.json(booking);
});

const statusUpdateSchema = z.object({ status: z.enum(BOOKING_STATUSES) });

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

/** Engineers who can be assigned jobs — populates the assignment dropdown. */
adminRouter.get("/technicians", async (_req, res) => {
  const technicians = await User.find({ role: "TECHNICIAN", ...NOT_DELETED })
    .select("name email phone")
    .sort({ name: 1 });
  res.json({ technicians });
});

const technicianSchema = z.object({
  /** Real engineer account. Null clears the assignment. */
  technicianId: z.string().trim().nullable().optional(),
  /** Kept for assigning someone who has no account yet. */
  technicianName: z.string().trim().nullable().optional(),
  technicianPhone: z.string().trim().nullable().optional(),
});

adminRouter.patch("/bookings/:reference/technician", async (req, res) => {
  const input = technicianSchema.parse(req.body);

  const booking = await Booking.findOne({ bookingReference: req.params.reference });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (input.technicianId) {
    const technician = await User.findOne({
      _id: input.technicianId,
      role: "TECHNICIAN",
      ...NOT_DELETED,
    });
    if (!technician) throw new ApiError(400, "That engineer account no longer exists.");

    booking.technicianId = technician._id;
    // Denormalised so the job still reads correctly if the account changes later.
    booking.technicianName = technician.name;
    booking.technicianPhone = technician.phone || null;

    // Move the job into the assigned state so it shows up in the engineer's list.
    if (booking.status === "BOOKING_RECEIVED" || booking.status === "CONFIRMED") {
      booking.status = "TECHNICIAN_ASSIGNED";
      booking.statusHistory.push({ status: "TECHNICIAN_ASSIGNED", at: new Date() });
    }

    await Notification.create({
      userId: technician._id,
      type: "technician_assigned",
      title: "New job assigned",
      message: `${booking.bookingReference} — ${booking.equipmentLabel} on ${booking.date}.`,
      href: `/technician/jobs/${booking.bookingReference}`,
    });
  } else {
    if (input.technicianId === null) booking.technicianId = null;
    if (input.technicianName !== undefined) booking.technicianName = input.technicianName;
    if (input.technicianPhone !== undefined) booking.technicianPhone = input.technicianPhone;
  }

  await booking.save();
  res.json(booking);
});

adminRouter.delete("/bookings/:reference", async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingReference: req.params.reference },
    { deletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!booking) throw new ApiError(404, "Booking not found");
  res.json({ ok: true, booking });
});

adminRouter.post("/bookings/:reference/restore", async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { bookingReference: req.params.reference },
    { deletedAt: null },
    { returnDocument: "after" }
  );
  if (!booking) throw new ApiError(404, "Booking not found");
  res.json({ ok: true, booking });
});

// ==================================================================
// Support tickets
// ==================================================================

adminRouter.get("/support-tickets", async (req, res) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = { ...archiveFilter(req) };
  if (typeof status === "string" && status) filter.status = status;
  const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ tickets });
});

const createTicketSchema = z.object({
  category: z.enum(SUPPORT_CATEGORIES),
  subject: z.string().trim().min(2),
  message: z.string().trim().min(2),
  email: z.string().trim().email(),
  status: z.enum(["OPEN", "RESOLVED"]).default("OPEN"),
  userId: z.string().trim().nullable().default(null),
});

adminRouter.post("/support-tickets", async (req, res) => {
  const input = createTicketSchema.parse(req.body);
  const ticket = await SupportTicket.create(input);
  res.status(201).json({ ticket });
});

const updateTicketSchema = createTicketSchema.partial();

adminRouter.patch("/support-tickets/:id", async (req, res) => {
  const patch = updateTicketSchema.parse(req.body);
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, patch, {
    returnDocument: "after",
  });
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ ticket });
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

adminRouter.post("/support-tickets/:id/reopen", async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status: "OPEN" },
    { returnDocument: "after" }
  );
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ ticket });
});

adminRouter.delete("/support-tickets/:id", async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { deletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ ok: true, ticket });
});

adminRouter.post("/support-tickets/:id/restore", async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { deletedAt: null },
    { returnDocument: "after" }
  );
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ ok: true, ticket });
});

// ==================================================================
// Users
// ==================================================================

const USER_PUBLIC_FIELDS = "-passwordHash -twoFactorSecret -twoFactorBackupCodes";

adminRouter.get("/users", async (req, res) => {
  const { search } = req.query;
  const filter: Record<string, unknown> = { ...archiveFilter(req) };
  if (typeof search === "string" && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const users = await User.find(filter)
    .select(USER_PUBLIC_FIELDS)
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ users });
});

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().default(""),
  role: z.enum(["CUSTOMER", "ADMIN", "TECHNICIAN"]).default("CUSTOMER"),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

adminRouter.post("/users", async (req, res) => {
  const input = createUserSchema.parse(req.body);
  const email = input.email.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with that email already exists.");

  // Admin sets the password directly in the console — no email involved.
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    name: input.name,
    email,
    phone: input.phone,
    role: input.role,
    passwordHash,
    emailVerified: true,
  });
  await assignReferralCode(user);

  const safe = await User.findById(user._id).select(USER_PUBLIC_FIELDS);
  res.status(201).json({ user: safe });
});

const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

// Admin resets a user's password directly (again, no email round-trip).
adminRouter.patch("/users/:id/password", async (req, res) => {
  const { password } = setPasswordSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { passwordHash },
    { returnDocument: "after" }
  ).select(USER_PUBLIC_FIELDS);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ ok: true, user });
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim(),
    role: z.enum(["CUSTOMER", "ADMIN", "TECHNICIAN"]),
    loyaltyPoints: z.number().int().min(0),
    emailVerified: z.boolean(),
  })
  .partial();

/** Guards that we never strip the last remaining admin of their access. */
async function assertNotLastAdmin(userId: string, action: string) {
  const target = await User.findById(userId);
  if (target?.role !== "ADMIN") return;
  const admins = await User.countDocuments({ role: "ADMIN", ...NOT_DELETED });
  if (admins <= 1) throw new ApiError(400, `Can't ${action} the last remaining admin.`);
}

adminRouter.patch("/users/:id", async (req, res) => {
  const patch = updateUserSchema.parse(req.body);
  const isSelf = req.params.id === String(req.userId);

  if (patch.role !== undefined) {
    if (isSelf) throw new ApiError(400, "You can't change your own role.");
    if (patch.role !== "ADMIN") await assertNotLastAdmin(req.params.id, "demote");
  }
  if (patch.email !== undefined) {
    const clash = await User.findOne({
      email: patch.email.toLowerCase(),
      _id: { $ne: req.params.id },
    });
    if (clash) throw new ApiError(409, "Another account already uses that email.");
    patch.email = patch.email.toLowerCase();
  }

  const user = await User.findByIdAndUpdate(req.params.id, patch, {
    returnDocument: "after",
  }).select(USER_PUBLIC_FIELDS);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user });
});

const roleSchema = z.object({ role: z.enum(["CUSTOMER", "ADMIN", "TECHNICIAN"]) });

adminRouter.patch("/users/:id/role", async (req, res) => {
  const { role } = roleSchema.parse(req.body);
  if (req.params.id === String(req.userId)) {
    throw new ApiError(400, "You can't change your own role.");
  }
  if (role !== "ADMIN") await assertNotLastAdmin(req.params.id, "demote");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { returnDocument: "after" }
  ).select(USER_PUBLIC_FIELDS);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user });
});

adminRouter.delete("/users/:id", async (req, res) => {
  if (req.params.id === String(req.userId)) {
    throw new ApiError(400, "You can't archive your own account.");
  }
  await assertNotLastAdmin(req.params.id, "archive");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { deletedAt: new Date() },
    { returnDocument: "after" }
  ).select(USER_PUBLIC_FIELDS);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ ok: true, user });
});

adminRouter.post("/users/:id/restore", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { deletedAt: null },
    { returnDocument: "after" }
  ).select(USER_PUBLIC_FIELDS);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ ok: true, user });
});

// ==================================================================
// Subscriptions (Care Plans)
// ==================================================================

adminRouter.get("/subscriptions", async (req, res) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = { ...archiveFilter(req) };
  if (typeof status === "string" && status) filter.status = status;
  const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 }).limit(300);
  res.json({ subscriptions });
});

const priceSchema = z
  .object({
    amount: z.number().positive(),
    currency: z.string().trim().default("GBP"),
    billingCycleMonths: z.number().int().positive(),
  })
  .nullable();

const adminCreateSubscriptionSchema = z.object({
  userId: z.string().trim().min(1),
  planId: z.string().trim().min(1),
  planName: z.string().trim().min(1),
  frequency: z.enum(FREQUENCIES),
  categoryId: z.enum(CATEGORY_IDS),
  equipmentId: z.string().trim().min(1),
  equipmentLabel: z.string().trim().min(1),
  status: z.enum(SUBSCRIPTION_STATUSES).default("ACTIVE"),
  address: z.object({
    houseNumber: z.string().trim().min(1),
    street: z.string().trim().min(1),
    city: z.string().trim().min(1),
    postcode: z.string().trim().min(1),
  }),
  notes: z.string().trim().default(""),
  price: priceSchema.optional(),
  servicesPerCycle: z.number().int().positive().nullable().optional(),
  startDate: z.string().trim().optional(),
  nextVisitDate: z.string().trim().optional(),
});

adminRouter.post("/subscriptions", async (req, res) => {
  const input = adminCreateSubscriptionSchema.parse(req.body);

  const owner = await User.exists({ _id: input.userId });
  if (!owner) throw new ApiError(400, "That customer account no longer exists.");

  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const nextVisitDate = input.nextVisitDate
    ? new Date(input.nextVisitDate)
    : computeNextVisitDate(input.frequency, startDate);

  const subscription = await Subscription.create({
    userId: input.userId,
    planId: input.planId,
    planName: input.planName,
    frequency: input.frequency,
    categoryId: input.categoryId,
    equipmentId: input.equipmentId,
    equipmentLabel: input.equipmentLabel,
    status: input.status,
    address: input.address,
    notes: input.notes,
    price: input.price ?? null,
    servicesPerCycle: input.servicesPerCycle ?? null,
    startDate,
    nextVisitDate,
  });

  res.status(201).json({ subscription });
});

const adminUpdateSubscriptionSchema = z
  .object({
    planId: z.string().trim().min(1),
    planName: z.string().trim().min(1),
    frequency: z.enum(FREQUENCIES),
    categoryId: z.enum(CATEGORY_IDS),
    equipmentId: z.string().trim().min(1),
    equipmentLabel: z.string().trim().min(1),
    status: z.enum(SUBSCRIPTION_STATUSES),
    address: z.object({
      houseNumber: z.string().trim().min(1),
      street: z.string().trim().min(1),
      city: z.string().trim().min(1),
      postcode: z.string().trim().min(1),
    }),
    notes: z.string().trim(),
    price: priceSchema,
    servicesPerCycle: z.number().int().positive().nullable(),
    startDate: z.string().trim(),
    nextVisitDate: z.string().trim(),
  })
  .partial();

adminRouter.patch("/subscriptions/:id", async (req, res) => {
  const patch = adminUpdateSubscriptionSchema.parse(req.body);
  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) throw new ApiError(404, "Subscription not found");

  const { startDate, nextVisitDate, ...rest } = patch;
  Object.assign(subscription, rest);
  if (startDate) subscription.startDate = new Date(startDate);
  if (nextVisitDate) subscription.nextVisitDate = new Date(nextVisitDate);
  await subscription.save();

  res.json({ subscription });
});

adminRouter.delete("/subscriptions/:id", async (req, res) => {
  const subscription = await Subscription.findByIdAndUpdate(
    req.params.id,
    { deletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!subscription) throw new ApiError(404, "Subscription not found");
  res.json({ ok: true, subscription });
});

adminRouter.post("/subscriptions/:id/restore", async (req, res) => {
  const subscription = await Subscription.findByIdAndUpdate(
    req.params.id,
    { deletedAt: null },
    { returnDocument: "after" }
  );
  if (!subscription) throw new ApiError(404, "Subscription not found");
  res.json({ ok: true, subscription });
});

async function loadSubscriptionForInvoice(id: string) {
  const subscription = await Subscription.findById(id);
  if (!subscription) throw new ApiError(404, "Subscription not found");
  if (!subscription.price?.amount) {
    throw new ApiError(400, "This plan has no billed amount to invoice.");
  }
  const user = await User.findById(subscription.userId);
  return { subscription, user };
}

adminRouter.get("/subscriptions/:id/invoice", async (req, res) => {
  const { subscription, user } = await loadSubscriptionForInvoice(req.params.id);
  streamSubscriptionInvoice(res, buildSubscriptionInvoiceData(subscription, user));
});

adminRouter.post("/subscriptions/:id/send-invoice", async (req, res) => {
  const { subscription, user } = await loadSubscriptionForInvoice(req.params.id);
  if (!user?.email) throw new ApiError(400, "This customer has no email address on file.");

  const data = buildSubscriptionInvoiceData(subscription, user);
  const pdf = await renderSubscriptionInvoice(data);
  const email = subscriptionInvoiceEmail(data);
  const result = await sendEmail({
    to: user.email,
    subject: email.subject,
    html: email.html,
    template: "subscription-invoice",
    attachments: [{ filename: `${data.invoiceNumber}.pdf`, content: pdf }],
  });

  res.json({ status: result.status, to: user.email, invoiceNumber: data.invoiceNumber });
});

// ==================================================================
// Reviews
// ==================================================================

adminRouter.get("/reviews", async (req, res) => {
  const reviews = await Review.find({ ...archiveFilter(req) })
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ reviews });
});

const createReviewSchema = z.object({
  userId: z.string().trim().min(1, "A customer is required for a review."),
  bookingReference: z.string().trim().min(1),
  serviceName: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().default(""),
});

adminRouter.post("/reviews", async (req, res) => {
  const input = createReviewSchema.parse(req.body);
  const review = await Review.create(input);
  res.status(201).json({ review });
});

const updateReviewSchema = z
  .object({
    serviceName: z.string().trim().min(1),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim(),
  })
  .partial();

adminRouter.patch("/reviews/:id", async (req, res) => {
  const patch = updateReviewSchema.parse(req.body);
  const review = await Review.findByIdAndUpdate(req.params.id, patch, {
    returnDocument: "after",
  });
  if (!review) throw new ApiError(404, "Review not found");
  res.json({ review });
});

adminRouter.delete("/reviews/:id", async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { deletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!review) throw new ApiError(404, "Review not found");
  res.json({ ok: true, review });
});

adminRouter.post("/reviews/:id/restore", async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { deletedAt: null },
    { returnDocument: "after" }
  );
  if (!review) throw new ApiError(404, "Review not found");
  res.json({ ok: true, review });
});

// ==================================================================
// Coupons
// ==================================================================

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
