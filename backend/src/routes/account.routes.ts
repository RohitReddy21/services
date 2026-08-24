import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { Address } from "../models/Address";
import { Notification } from "../models/Notification";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const accountRouter = Router();
accountRouter.use(requireAuth);

function toPublicUser(user: InstanceType<typeof User>) {
  const obj = user.toJSON() as Record<string, unknown>;
  const { passwordHash: _passwordHash, ...rest } = obj;
  return rest;
}

// ---------------- Profile ----------------

accountRouter.get("/profile", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user: toPublicUser(user) });
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(6).optional(),
  profileImage: z.string().nullable().optional(),
  notificationPreferences: z
    .object({ email: z.boolean(), sms: z.boolean() })
    .optional(),
});

accountRouter.patch("/profile", async (req, res) => {
  const patch = updateProfileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.userId, patch, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user: toPublicUser(user) });
});

// ---------------- Addresses ----------------

accountRouter.get("/addresses", async (req, res) => {
  const addresses = await Address.find({ userId: req.userId });
  res.json({ addresses });
});

const addressSchema = z.object({
  label: z.enum(["Home", "Business", "Other"]).default("Home"),
  houseNumber: z.string().trim().min(1),
  street: z.string().trim().min(1),
  city: z.string().trim().min(1),
  postcode: z.string().trim().min(1),
  instructions: z.string().trim().default(""),
  isDefault: z.boolean().default(false),
});

accountRouter.post("/addresses", async (req, res) => {
  const input = addressSchema.parse(req.body);

  const existingCount = await Address.countDocuments({ userId: req.userId });
  const isDefault = input.isDefault || existingCount === 0;

  if (isDefault) {
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
  }

  const address = await Address.create({ ...input, isDefault, userId: req.userId });
  res.status(201).json({ address });
});

const addressPatchSchema = addressSchema.partial();

accountRouter.patch("/addresses/:id", async (req, res) => {
  const patch = addressPatchSchema.parse(req.body);

  const existing = await Address.findOne({ _id: req.params.id, userId: req.userId });
  if (!existing) throw new ApiError(404, "Address not found");

  if (patch.isDefault) {
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
  }

  Object.assign(existing, patch);
  await existing.save();
  res.json({ address: existing });
});

accountRouter.delete("/addresses/:id", async (req, res) => {
  const result = await Address.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw new ApiError(404, "Address not found");
  res.json({ ok: true });
});

// ---------------- Notifications ----------------

accountRouter.get("/notifications", async (req, res) => {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ notifications });
});

accountRouter.patch("/notifications/:id/read", async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  res.json({ notification });
});
