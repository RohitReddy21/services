import { Router } from "express";
import { z } from "zod";
import { getDayAvailability, getSlotsForDate, isSlotAvailable } from "../lib/slots";
import { SlotReservation } from "../models/SlotReservation";
import { generateToken } from "../lib/tokens";
import { ApiError } from "../middleware/errorHandler";
import { reserveSlotSchema } from "../validation/booking";

export const availabilityRouter = Router();

const RESERVATION_TTL_MS = 10 * 60 * 1000;

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid or missing 'month' parameter"),
  category: z.string().optional().default(""),
  equipment: z.string().optional().default(""),
});

availabilityRouter.get("/", async (req, res) => {
  const { month, category, equipment } = monthQuerySchema.parse(req.query);
  const seed = `${category}::${equipment}`;
  const [year, monthIndex] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = `${month}-${String(i + 1).padStart(2, "0")}`;
    return { date: dateStr, hasAvailability: getDayAvailability(dateStr, seed) };
  });

  res.json({ days });
});

const daySlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid or missing 'date' parameter"),
  category: z.string().optional().default(""),
  equipment: z.string().optional().default(""),
});

availabilityRouter.get("/slots", async (req, res) => {
  const { date, category, equipment } = daySlotsQuerySchema.parse(req.query);
  const seed = `${category}::${equipment}`;
  const groups = await getSlotsForDate(date, seed);
  res.json({ groups });
});

export const slotsRouter = Router();

slotsRouter.post("/reserve", async (req, res) => {
  const { date, slotId, category, equipment } = reserveSlotSchema.parse(req.body);
  const seed = `${category}::${equipment}`;

  const available = await isSlotAvailable(date, slotId, seed);
  if (!available) throw new ApiError(409, "That slot is no longer available.");

  const reservationId = generateToken("res");
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

  await SlotReservation.create({
    token: reservationId,
    date,
    slotId,
    categoryId: category,
    equipmentId: equipment,
    expiresAt,
  });

  res.json({ reservationId, expiresAt: expiresAt.getTime() });
});
