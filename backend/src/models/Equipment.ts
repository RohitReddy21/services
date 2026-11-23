import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const equipmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoryId: { type: String, enum: ["air-conditioning", "refrigeration"], required: true },
    equipmentId: { type: String, required: true },
    equipmentLabel: { type: String, required: true },
    nickname: { type: String, default: "", trim: true },
    brand: { type: String, default: "", trim: true },
    serialNumber: { type: String, default: "", trim: true },
    installDate: { type: Date, default: null },
    warrantyExpiry: { type: Date, default: null },
    addressId: { type: Schema.Types.ObjectId, ref: "Address", default: null },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

withJsonId(equipmentSchema);

export const Equipment = model("Equipment", equipmentSchema);
