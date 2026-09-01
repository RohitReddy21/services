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
    twoFactorSecret: { type: String, default: null },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorBackupCodes: { type: [String], default: [] },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    // Soft delete: set to archive an account without breaking the bookings,
    // subscriptions and reviews that reference it. Excluded from every list by
    // default; admins can view and restore archived records.
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

withJsonId(userSchema);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = model("User", userSchema);
