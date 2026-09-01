import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const SUPPORT_CATEGORIES = [
  "booking_help",
  "reschedule_help",
  "cancellation_help",
  "service_questions",
  "technical_questions",
  "general_enquiry",
] as const;

const supportTicketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    category: { type: String, enum: SUPPORT_CATEGORIES, required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    status: { type: String, enum: ["OPEN", "RESOLVED"], default: "OPEN" },

    // Soft delete — archived tickets are hidden from the admin list by default.
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

withJsonId(supportTicketSchema);

export const SupportTicket = model("SupportTicket", supportTicketSchema);
