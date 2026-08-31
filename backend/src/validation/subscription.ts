import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1),
  planName: z.string().min(1),
  frequency: z.enum(["monthly", "annual", "bi-annual", "quarterly", "quarterly-bundle"]),
  categoryId: z.enum(["air-conditioning", "refrigeration", "electrical"]),
  equipmentId: z.string().min(1),
  equipmentLabel: z.string().min(1),
  address: z.object({
    houseNumber: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    postcode: z.string().min(1),
  }),
  notes: z.string().default(""),
  price: z
    .object({
      amount: z.number().positive(),
      currency: z.literal("GBP"),
      billingCycleMonths: z.number().int().positive(),
    })
    .nullable()
    .optional(),
  servicesPerCycle: z.number().int().positive().nullable().optional(),
  couponCode: z.string().trim().nullable().optional(),
});
