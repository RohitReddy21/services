import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, enum: ["Home", "Business", "Other"], default: "Home" },
    houseNumber: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postcode: { type: String, required: true, trim: true },
    instructions: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

withJsonId(addressSchema);

export const Address = model("Address", addressSchema);
