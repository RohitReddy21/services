import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, default: "", trim: true },
    discountType: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    maxRedemptions: { type: Number, default: null },
    timesRedeemed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

withJsonId(couponSchema);

export const Coupon = model("Coupon", couponSchema);
