import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const emailEventSchema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    template: { type: String, required: true },
    status: { type: String, enum: ["sent", "logged", "failed"], required: true },
    // "logged" = RESEND_API_KEY not configured, email was written to server
    // logs instead of actually sent (see lib/email.ts).
    providerId: { type: String, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

withJsonId(emailEventSchema);

export const EmailEvent = model("EmailEvent", emailEventSchema);
