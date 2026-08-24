import { Schema, model } from "mongoose";

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
  },
  { timestamps: true }
);

export const SupportTicket = model("SupportTicket", supportTicketSchema);
