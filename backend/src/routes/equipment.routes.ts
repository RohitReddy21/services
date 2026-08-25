import { Router } from "express";
import { Equipment } from "../models/Equipment";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { equipmentPatchSchema, equipmentSchema } from "../validation/equipment";

export const equipmentRouter = Router();
equipmentRouter.use(requireAuth);

equipmentRouter.get("/", async (req, res) => {
  const equipment = await Equipment.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ equipment });
});

equipmentRouter.post("/", async (req, res) => {
  const input = equipmentSchema.parse(req.body);
  const equipment = await Equipment.create({ ...input, userId: req.userId });
  res.status(201).json({ equipment });
});

equipmentRouter.patch("/:id", async (req, res) => {
  const patch = equipmentPatchSchema.parse(req.body);

  const existing = await Equipment.findOne({ _id: req.params.id, userId: req.userId });
  if (!existing) throw new ApiError(404, "Equipment not found");

  Object.assign(existing, patch);
  await existing.save();
  res.json({ equipment: existing });
});

equipmentRouter.delete("/:id", async (req, res) => {
  const result = await Equipment.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw new ApiError(404, "Equipment not found");
  res.json({ ok: true });
});
