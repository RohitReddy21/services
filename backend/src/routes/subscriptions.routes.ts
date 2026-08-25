import { Router } from "express";
import { Subscription } from "../models/Subscription";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { createSubscriptionSchema } from "../validation/subscription";
import { sendEmail } from "../lib/email";
import { subscriptionCreatedEmail } from "../emails/subscription-created";

export const subscriptionsRouter = Router();
subscriptionsRouter.use(requireAuth);

const MONTHS_PER_VISIT: Record<string, number> = {
  quarterly: 3,
  "quarterly-bundle": 3,
  "bi-annual": 6,
  annual: 12,
};

function computeNextVisitDate(frequency: string, from: Date) {
  const next = new Date(from);
  next.setMonth(next.getMonth() + (MONTHS_PER_VISIT[frequency] ?? 12));
  return next;
}

subscriptionsRouter.get("/", async (req, res) => {
  const subscriptions = await Subscription.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ subscriptions });
});

subscriptionsRouter.post("/", async (req, res) => {
  const input = createSubscriptionSchema.parse(req.body);

  const startDate = new Date();
  const nextVisitDate = computeNextVisitDate(input.frequency, startDate);

  const subscription = await Subscription.create({
    ...input,
    userId: req.userId,
    status: "ACTIVE",
    startDate,
    nextVisitDate,
  });

  const user = await User.findById(req.userId);
  if (user) {
    const subEmail = subscriptionCreatedEmail({
      planName: input.planName,
      frequency: input.frequency,
      equipmentLabel: input.equipmentLabel,
    });
    void sendEmail({
      to: user.email,
      subject: subEmail.subject,
      html: subEmail.html,
      template: "subscription-created",
    });
  }

  res.status(201).json({ subscription });
});

async function findOwned(id: string, userId: string) {
  const subscription = await Subscription.findOne({ _id: id, userId });
  if (!subscription) throw new ApiError(404, "Subscription not found");
  return subscription;
}

subscriptionsRouter.post("/:id/pause", async (req, res) => {
  const subscription = await findOwned(req.params.id, req.userId!);
  if (subscription.status === "ACTIVE") subscription.status = "PAUSED";
  await subscription.save();
  res.json({ subscription });
});

subscriptionsRouter.post("/:id/resume", async (req, res) => {
  const subscription = await findOwned(req.params.id, req.userId!);
  if (subscription.status === "PAUSED") {
    subscription.status = "ACTIVE";
    subscription.nextVisitDate = computeNextVisitDate(subscription.frequency, new Date());
  }
  await subscription.save();
  res.json({ subscription });
});

subscriptionsRouter.post("/:id/cancel", async (req, res) => {
  const subscription = await findOwned(req.params.id, req.userId!);
  subscription.status = "CANCELLED";
  await subscription.save();
  res.json({ subscription });
});
