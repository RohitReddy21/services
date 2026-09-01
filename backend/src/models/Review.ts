import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookingReference: { type: String, required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: "", trim: true },

    // Soft delete — archived reviews are hidden from the public site and the
    // admin list by default but can be restored.
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

withJsonId(reviewSchema);

export const Review = model("Review", reviewSchema);
