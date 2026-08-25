import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const SUBSCRIPTION_STATUSES = ["ACTIVE", "PAUSED", "CANCELLED"] as const;
const FREQUENCIES = ["annual", "bi-annual", "quarterly", "quarterly-bundle"] as const;

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    frequency: { type: String, enum: FREQUENCIES, required: true },
    categoryId: { type: String, enum: ["air-conditioning", "refrigeration"], required: true },
    equipmentId: { type: String, required: true },
    equipmentLabel: { type: String, required: true },
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: "ACTIVE" },
    startDate: { type: Date, required: true },
    nextVisitDate: { type: Date, required: true },
    address: {
      houseNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postcode: { type: String, required: true },
    },
    notes: { type: String, default: "" },
    price: {
      amount: { type: Number, default: null },
      currency: { type: String, default: null },
      billingCycleMonths: { type: Number, default: null },
    },
    servicesPerCycle: { type: Number, default: null },
  },
  { timestamps: true }
);

withJsonId(subscriptionSchema);

export const Subscription = model("Subscription", subscriptionSchema);
