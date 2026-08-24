import { Router } from "express";
import { z } from "zod";
import { Review } from "../models/Review";
import { Booking } from "../models/Booking";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const reviewsRouter = Router();

reviewsRouter.get("/", requireAuth, async (req, res) => {
  const reviews = await Review.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ reviews });
});

const createReviewSchema = z.object({
  bookingReference: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().default(""),
});

reviewsRouter.post("/", requireAuth, async (req, res) => {
  const { bookingReference, rating, text } = createReviewSchema.parse(req.body);

  const booking = await Booking.findOne({ bookingReference });
  if (!booking || booking.customerId?.toString() !== req.userId) {
    throw new ApiError(404, "Booking not found");
  }
  if (booking.status !== "COMPLETED") {
    throw new ApiError(400, "You can only review completed services.");
  }

  const review = await Review.create({
    userId: req.userId,
    bookingReference,
    serviceName: booking.equipmentLabel,
    rating,
    text,
  });

  res.status(201).json({ review });
});
