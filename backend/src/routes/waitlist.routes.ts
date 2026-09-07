import { Router } from "express";
import { Waitlist } from "../models/Waitlist";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { isSlotAvailable } from "../lib/slots";
import { waitlistJoinSchema } from "../validation/waitlist";

export const waitlistRouter = Router();
waitlistRouter.use(requireAuth);

waitlistRouter.post("/", async (req, res) => {
  const input = waitlistJoinSchema.parse(req.body);

  const seed = `${input.categoryId}::${input.equipmentId}`;
  const available = await isSlotAvailable(input.date, input.slotId, seed);
  if (available) {
    throw new ApiError(400, "That slot is available — please book it directly.");
  }

  const user = await User.findById(req.userId).select("name email phone");
  if (!user) throw new ApiError(404, "User not found");

  const existing = await Waitlist.findOne({
    userId: req.userId,
    date: input.date,
    slotId: input.slotId,
    status: { $in: ["WAITING", "NOTIFIED"] },
    deletedAt: null,
  });
  if (existing) return res.json({ entry: existing });

  const entry = await Waitlist.create({
    userId: req.userId,
    date: input.date,
    slotId: input.slotId,
    slotLabel: input.slotLabel,
    categoryId: input.categoryId,
    equipmentId: input.equipmentId,
    equipmentLabel: input.equipmentLabel,
    contact: { name: user.name, email: user.email, phone: user.phone || "" },
  });

  res.status(201).json({ entry });
});

waitlistRouter.get("/mine", async (req, res) => {
  const entries = await Waitlist.find({
    userId: req.userId,
    status: { $in: ["WAITING", "NOTIFIED"] },
    deletedAt: null,
  }).sort({ createdAt: -1 });
  res.json({ entries });
});

waitlistRouter.delete("/:id", async (req, res) => {
  const entry = await Waitlist.findOne({ _id: req.params.id, userId: req.userId });
  if (!entry) throw new ApiError(404, "Waitlist entry not found");
  entry.deletedAt = new Date();
  await entry.save();
  res.json({ ok: true });
});
