import { z } from "zod";

export const equipmentSchema = z.object({
  categoryId: z.enum(["air-conditioning", "refrigeration", "electrical"]),
  equipmentId: z.string().min(1),
  equipmentLabel: z.string().min(1),
  nickname: z.string().trim().default(""),
  brand: z.string().trim().default(""),
  serialNumber: z.string().trim().default(""),
  installDate: z.string().trim().nullable().default(null),
  warrantyExpiry: z.string().trim().nullable().default(null),
  addressId: z.string().trim().nullable().default(null),
  notes: z.string().trim().default(""),
});

export const equipmentPatchSchema = equipmentSchema.partial();
