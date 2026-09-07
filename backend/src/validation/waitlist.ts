import { z } from "zod";

export const waitlistJoinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  slotId: z.string().min(1),
  slotLabel: z.string().min(1),
  categoryId: z.string().min(1),
  equipmentId: z.string().min(1),
  equipmentLabel: z.string().min(1),
});
