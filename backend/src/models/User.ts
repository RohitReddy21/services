import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true, index: true },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["CUSTOMER", "ADMIN", "TECHNICIAN"], default: "CUSTOMER" },
    profileImage: { type: String, default: null },
    loyaltyPoints: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

withJsonId(userSchema);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = model("User", userSchema);
