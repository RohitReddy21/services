import { Router } from "express";
import { Subscription } from "../models/Subscription";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { createSubscriptionSchema } from "../validation/subscription";
import { sendEmail } from "../lib/email";
import { subscriptionCreatedEmail } from "../emails/subscription-created";
import { subscriptionInvoiceEmail } from "../emails/subscription-invoice";
import { awardLoyaltyPoints } from "../lib/loyalty";
import { renderSubscriptionInvoice, streamSubscriptionInvoice } from "../lib/pdf";
import { buildSubscriptionInvoiceData } from "../lib/invoice";
import { applyDiscount, findValidCoupon } from "../lib/coupons";

export const subscriptionsRouter = Router();
subscriptionsRouter.use(requireAuth);

const MONTHS_PER_VISIT: Record<string, number> = {
  monthly: 1,
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
  const { couponCode, ...input } = createSubscriptionSchema.parse(req.body);

  const startDate = new Date();
  const nextVisitDate = computeNextVisitDate(input.frequency, startDate);

  let price = input.price ?? null;
  let originalAmount: number | null = null;
  let appliedCouponCode: string | null = null;

  if (couponCode && price?.amount) {
    const result = await findValidCoupon(couponCode);
    if ("error" in result) throw new ApiError(400, result.error ?? "Invalid coupon code.");

    originalAmount = price.amount;
    price = { ...price, amount: applyDiscount(price.amount, result.coupon) };
    appliedCouponCode = result.coupon.code;

    result.coupon.timesRedeemed += 1;
    await result.coupon.save();
  }

  const subscription = await Subscription.create({
    ...input,
    price,
    originalAmount,
    couponCode: appliedCouponCode,
    userId: req.userId,
    status: "ACTIVE",
    startDate,
    nextVisitDate,
  });

  void awardLoyaltyPoints({
    userId: req.userId!,
    amount: 50,
    reason: "subscription_created",
    description: `Subscribed to ${input.planName}`,
  });

  // Auto-generate the invoice PDF and email it to the customer. Priced Care
  // Plans get the full invoice email with the PDF attached; anything without a
  // billed amount falls back to the plain confirmation email.
  void (async () => {
    try {
      const user = await User.findById(req.userId);
      if (!user?.email) return;

      if (subscription.price?.amount) {
        const data = buildSubscriptionInvoiceData(subscription, user);
        const pdf = await renderSubscriptionInvoice(data);
        const email = subscriptionInvoiceEmail(data);
        await sendEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
          template: "subscription-invoice",
          attachments: [{ filename: `${data.invoiceNumber}.pdf`, content: pdf }],
        });
      } else {
        const subEmail = subscriptionCreatedEmail({
          planName: input.planName,
          frequency: input.frequency,
          equipmentLabel: input.equipmentLabel,
        });
        await sendEmail({
          to: user.email,
          subject: subEmail.subject,
          html: subEmail.html,
          template: "subscription-created",
        });
      }
    } catch (err) {
      console.error("[subscription] invoice email failed:", err);
    }
  })();

  res.status(201).json({ subscription });
});

async function findOwned(id: string, userId: string) {
  const subscription = await Subscription.findOne({ _id: id, userId });
  if (!subscription) throw new ApiError(404, "Subscription not found");
  return subscription;
}

subscriptionsRouter.get("/:id/invoice", async (req, res) => {
  const subscription = await findOwned(req.params.id, req.userId!);
  if (!subscription.price?.amount) {
    throw new ApiError(400, "This plan does not have online billing — pricing is confirmed directly with our team.");
  }

  const user = await User.findById(req.userId);
  streamSubscriptionInvoice(res, buildSubscriptionInvoiceData(subscription, user));
});

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
