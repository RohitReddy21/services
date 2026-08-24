import { Router } from "express";
import { z } from "zod";
import { SupportTicket } from "../models/SupportTicket";
import { attachUser } from "../middleware/auth";
import { sendEmail } from "../lib/email";
import { supportReceivedEmail } from "../emails/support-received";

export const supportRouter = Router();

const createTicketSchema = z.object({
  category: z.enum([
    "booking_help",
    "reschedule_help",
    "cancellation_help",
    "service_questions",
    "technical_questions",
    "general_enquiry",
  ]),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
  email: z.string().trim().email(),
});

supportRouter.post("/", attachUser, async (req, res) => {
  const input = createTicketSchema.parse(req.body);
  const ticket = await SupportTicket.create({ ...input, userId: req.userId ?? null });

  const ack = supportReceivedEmail(input.subject);
  void sendEmail({ to: input.email, subject: ack.subject, html: ack.html, template: "support-received" });

  res.status(201).json({ ticket });
});
