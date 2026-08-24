import { Schema, model } from "mongoose";

const slotReservationSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true, index: true },
    slotId: { type: String, required: true },
    categoryId: { type: String, required: true },
    equipmentId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

slotReservationSchema.index({ date: 1, slotId: 1 });
// MongoDB TTL index — expired reservations are removed automatically.
slotReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SlotReservation = model("SlotReservation", slotReservationSchema);
