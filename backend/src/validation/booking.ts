import { z } from "zod";

const timeSlotSchema = z.object({
  id: z.string(),
  label: z.string(),
  start: z.string(),
  end: z.string(),
});

export const reserveSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  slotId: z.string().min(1),
  category: z.string().min(1),
  equipment: z.string().min(1),
});

export const createBookingSchema = z.object({
  reservationId: z.string().min(1),
  data: z.object({
    categoryId: z.enum(["air-conditioning", "refrigeration"]),
    equipmentId: z.string().min(1),
    equipmentLabel: z.string().min(1),
    requirement: z.enum([
      "installation",
      "repair",
      "servicing",
      "maintenance",
      "replacement",
      "diagnostics",
      "emergency",
      "other",
    ]),
    description: z.string().default(""),
    photos: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlot: timeSlotSchema,
    customer: z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(6),
      preferredContact: z.enum(["phone", "email", "sms"]),
    }),
    address: z.object({
      houseNumber: z.string().min(1),
      street: z.string().min(1),
      city: z.string().min(1),
      postcode: z.string().min(1),
      instructions: z.string().default(""),
    }),
  }),
});

export const rescheduleSchema = z.object({
  note: z.string().default(""),
});
