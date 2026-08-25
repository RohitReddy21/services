import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const loyaltyTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["EARN", "REDEEM"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reason: { type: String, required: true },
    description: { type: String, default: "" },
    voucherCode: { type: String, default: null },
  },
  { timestamps: true }
);

withJsonId(loyaltyTransactionSchema);

export const LoyaltyTransaction = model("LoyaltyTransaction", loyaltyTransactionSchema);
