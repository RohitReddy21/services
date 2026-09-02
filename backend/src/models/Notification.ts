import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const NOTIFICATION_TYPES = [
  "booking_received",
  "booking_confirmed",
  "appointment_reminder",
  "technician_assigned",
  "status_changed",
  "service_completed",
  "review_request",
  "support_response",
  "issue_reported",
  "welcome",
] as const;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    href: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

withJsonId(notificationSchema);

export const Notification = model("Notification", notificationSchema);
