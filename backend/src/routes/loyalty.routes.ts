import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { LoyaltyTransaction } from "../models/LoyaltyTransaction";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { LOYALTY_REWARDS, redeemLoyaltyReward } from "../lib/loyalty";

export const loyaltyRouter = Router();
loyaltyRouter.use(requireAuth);

loyaltyRouter.get("/", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");

  const transactions = await LoyaltyTransaction.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    balance: user.loyaltyPoints,
    rewards: LOYALTY_REWARDS,
    transactions,
  });
});

const redeemSchema = z.object({
  rewardId: z.enum(LOYALTY_REWARDS.map((r) => r.id) as [string, ...string[]]),
});

loyaltyRouter.post("/redeem", async (req, res) => {
  const { rewardId } = redeemSchema.parse(req.body);

  try {
    const result = await redeemLoyaltyReward(req.userId!, rewardId as never);
    res.json(result);
  } catch (err) {
    throw new ApiError(400, err instanceof Error ? err.message : "Could not redeem reward");
  }
});
