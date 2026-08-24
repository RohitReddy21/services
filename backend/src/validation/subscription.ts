import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1),
  planName: z.string().min(1),
  frequency: z.enum(["annual", "bi-annual", "quarterly"]),
  categoryId: z.enum(["air-conditioning", "refrigeration"]),
  equipmentId: z.string().min(1),
  equipmentLabel: z.string().min(1),
  address: z.object({
    houseNumber: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    postcode: z.string().min(1),
  }),
  notes: z.string().default(""),
});
