import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookingReference: { type: String, required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

withJsonId(reviewSchema);

export const Review = model("Review", reviewSchema);
