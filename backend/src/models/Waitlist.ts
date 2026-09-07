import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const WAITLIST_STATUSES = ["WAITING", "NOTIFIED", "CONVERTED", "EXPIRED"] as const;

const waitlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    slotId: { type: String, required: true },
    slotLabel: { type: String, required: true },
    categoryId: { type: String, required: true },
    equipmentId: { type: String, required: true },
    equipmentLabel: { type: String, required: true },
    contact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    status: { type: String, enum: WAITLIST_STATUSES, default: "WAITING" },
    notifiedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

waitlistSchema.index({ date: 1, slotId: 1, status: 1 });

withJsonId(waitlistSchema);

export const Waitlist = model("Waitlist", waitlistSchema);
