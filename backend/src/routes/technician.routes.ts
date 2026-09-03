import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Booking } from "../models/Booking";
import { Notification } from "../models/Notification";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { requireTechnician } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { sendEmail } from "../lib/email";
import { requestReview } from "../lib/review-request";
import { bookingStatusUpdatedEmail } from "../emails/booking-status-updated";

export const technicianRouter = Router();
technicianRouter.use(requireTechnician);

/**
 * What an engineer is allowed to do to a job from the field. Deliberately a
 * one-way walk down the pipeline: confirming, cancelling and rescheduling stay
 * with the office, so a mis-tap on site can't lose a booking.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  BOOKING_RECEIVED: [],
  CONFIRMED: ["TECHNICIAN_ARRIVING"],
  TECHNICIAN_ASSIGNED: ["TECHNICIAN_ARRIVING"],
  TECHNICIAN_ARRIVING: ["SERVICE_STARTED"],
  SERVICE_STARTED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const OPEN_STATUSES = [
  "BOOKING_RECEIVED",
  "CONFIRMED",
  "TECHNICIAN_ASSIGNED",
  "TECHNICIAN_ARRIVING",
  "SERVICE_STARTED",
];

function todayISO() {
  // Booking.date is stored as a plain "YYYY-MM-DD" string.
  return new Date().toISOString().slice(0, 10);
}

/**
 * Engineers only ever see their own jobs. Admins may open a single job by
 * reference (to talk an engineer through it) but their list is still their own.
 */
async function loadAssignedJob(reference: string, userId: string, isAdmin: boolean) {
  const filter: Record<string, unknown> = { bookingReference: reference, deletedAt: null };
  if (!isAdmin) filter.technicianId = userId;
  const booking = await Booking.findOne(filter);
  if (!booking) throw new ApiError(404, "Job not found");
  return booking;
}

// ---------------- Me ----------------

/**
 * The engineer's own scorecard: jobs completed and how customers rated them.
 * Ratings are attributed at review time, so this is "how did I do", not
 * "how did the company do".
 */
technicianRouter.get("/me", async (req, res) => {
  const [completed, agg, recent] = await Promise.all([
    Booking.countDocuments({ technicianId: req.userId, status: "COMPLETED", deletedAt: null }),
    Review.aggregate<{ avg: number; count: number }>([
      { $match: { technicianId: new Types.ObjectId(String(req.userId)), deletedAt: null } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Review.find({ technicianId: req.userId, deletedAt: null })
      .select("rating text serviceName bookingReference createdAt")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    jobsCompleted: completed,
    reviewCount: agg[0]?.count ?? 0,
    avgRating: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : null,
    recentReviews: recent,
  });
});

// ---------------- Jobs ----------------

technicianRouter.get("/jobs", async (req, res) => {
  const scope = typeof req.query.scope === "string" ? req.query.scope : "active";
  const today = todayISO();

  const filter: Record<string, unknown> = { technicianId: req.userId, deletedAt: null };

  if (scope === "today") {
    filter.date = today;
    filter.status = { $in: OPEN_STATUSES };
  } else if (scope === "upcoming") {
    filter.date = { $gt: today };
    filter.status = { $in: OPEN_STATUSES };
  } else if (scope === "completed") {
    filter.status = "COMPLETED";
  } else {
    filter.status = { $in: OPEN_STATUSES };
  }

  const jobs = await Booking.find(filter)
    // Within a day, run in slot order — that's the order the van drives in.
    .sort(scope === "completed" ? { completedAt: -1 } : { date: 1, "timeSlot.start": 1 })
    .limit(200);

  res.json({ jobs, today });
});

/** Counts for the portal's tab badges. */
technicianRouter.get("/jobs/summary", async (req, res) => {
  const today = todayISO();
  const base = { technicianId: req.userId, deletedAt: null };
  const todayFilter: Record<string, unknown> = {
    ...base,
    date: today,
    status: { $in: OPEN_STATUSES },
  };
  const upcomingFilter: Record<string, unknown> = {
    ...base,
    date: { $gt: today },
    status: { $in: OPEN_STATUSES },
  };
  const completedFilter: Record<string, unknown> = { ...base, status: "COMPLETED" };

  const [todayCount, upcoming, completed] = await Promise.all([
    Booking.countDocuments(todayFilter),
    Booking.countDocuments(upcomingFilter),
    Booking.countDocuments(completedFilter),
  ]);

  res.json({ today: todayCount, upcoming, completed });
});

technicianRouter.get("/jobs/:reference", async (req, res) => {
  const booking = await loadAssignedJob(req.params.reference, req.userId!, Boolean(req.isAdmin));
  res.json({ job: booking });
});

const statusSchema = z.object({
  status: z.enum(["TECHNICIAN_ARRIVING", "SERVICE_STARTED", "COMPLETED"]),
});

technicianRouter.patch("/jobs/:reference/status", async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  const booking = await loadAssignedJob(req.params.reference, req.userId!, Boolean(req.isAdmin));

  const allowed = ALLOWED_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      `Can't move this job from ${booking.status.replaceAll("_", " ").toLowerCase()} to ${status
        .replaceAll("_", " ")
        .toLowerCase()}.`
    );
  }

  const now = new Date();
  booking.status = status;
  booking.statusHistory.push({ status, at: now });
  if (status === "COMPLETED") booking.completedAt = now;
  await booking.save();

  await notifyCustomer(booking, status);
  if (status === "COMPLETED") void requestReview(booking);

  res.json({ job: booking });
});

const completionSchema = z.object({
  notes: z.string().trim().default(""),
  photos: z
    .array(z.object({ name: z.string().trim().min(1), url: z.string().trim().min(1) }))
    .default([]),
  complete: z.boolean().default(true),
});

/** Close the job out: engineer's notes, on-site photos, and the real timestamp. */
technicianRouter.post("/jobs/:reference/completion", async (req, res) => {
  const { notes, photos, complete } = completionSchema.parse(req.body);
  const booking = await loadAssignedJob(req.params.reference, req.userId!, Boolean(req.isAdmin));

  if (booking.status === "CANCELLED") {
    throw new ApiError(400, "This job was cancelled.");
  }

  booking.completionNotes = notes;
  if (photos.length) booking.completionPhotos.push(...photos);

  const wasOpen = booking.status !== "COMPLETED";
  if (complete && wasOpen) {
    const now = new Date();
    booking.status = "COMPLETED";
    booking.statusHistory.push({ status: "COMPLETED", at: now });
    booking.completedAt = now;
  }
  await booking.save();

  if (complete && wasOpen) {
    await notifyCustomer(booking, "COMPLETED");
    void requestReview(booking);
  }

  res.json({ job: booking });
});

const issueSchema = z.object({
  note: z.string().trim().min(3, "Tell the office what the problem is."),
  needsRevisit: z.boolean().default(false),
});

/**
 * The engineer can't finish this visit — no access, parts needed, unsafe.
 * Deliberately does NOT change the status: the office decides what happens
 * next. It just puts the problem in front of them.
 */
technicianRouter.post("/jobs/:reference/issue", async (req, res) => {
  const { note, needsRevisit } = issueSchema.parse(req.body);
  const booking = await loadAssignedJob(req.params.reference, req.userId!, Boolean(req.isAdmin));

  booking.issueNote = note;
  booking.issueReportedAt = new Date();
  if (needsRevisit) {
    booking.rescheduleRequested = true;
    booking.rescheduleNote = note;
  }
  await booking.save();

  // Tell every admin, since jobs aren't owned by one person in the office.
  const admins = await User.find({ role: "ADMIN", deletedAt: null }).select("_id");
  await Notification.insertMany(
    admins.map((admin) => ({
      userId: admin._id,
      type: "issue_reported",
      title: needsRevisit ? "Job needs another visit" : "Issue reported on a job",
      message: `${booking.bookingReference} — ${note}`,
      href: `/admin`,
    }))
  );

  res.json({ job: booking });
});

/** Clear a resolved issue (engineer got going again). */
technicianRouter.delete("/jobs/:reference/issue", async (req, res) => {
  const booking = await loadAssignedJob(req.params.reference, req.userId!, Boolean(req.isAdmin));
  booking.issueNote = null;
  booking.issueReportedAt = null;
  booking.rescheduleRequested = false;
  booking.rescheduleNote = null;
  await booking.save();
  res.json({ job: booking });
});

/**
 * Previous visits to the same customer — what was done last time is the
 * context an engineer usually wants and can't get on site today.
 */
technicianRouter.get("/jobs/:reference/history", async (req, res) => {
  const booking = await loadAssignedJob(req.params.reference, req.userId!, Boolean(req.isAdmin));

  const match: Record<string, unknown> = booking.customerId
    ? { customerId: booking.customerId }
    : { "customer.email": booking.customer?.email };

  const history = await Booking.find({
    ...match,
    bookingReference: { $ne: booking.bookingReference },
    deletedAt: null,
  })
    .select(
      "bookingReference status date equipmentLabel requirement completionNotes completedAt technicianName"
    )
    .sort({ date: -1 })
    .limit(10);

  res.json({ history });
});

/** Mirrors the admin status-change side effects so the customer sees the same thing. */
async function notifyCustomer(
  booking: Awaited<ReturnType<typeof loadAssignedJob>>,
  status: string
) {
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
    const email = bookingStatusUpdatedEmail({
      bookingReference: booking.bookingReference,
      equipmentLabel: booking.equipmentLabel,
      status: status as Parameters<typeof bookingStatusUpdatedEmail>[0]["status"],
    });
    void sendEmail({
      to: booking.customer.email,
      subject: email.subject,
      html: email.html,
      template: "booking-status-updated",
    });
  }
}
