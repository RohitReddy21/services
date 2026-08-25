import { Router } from "express";
import { User } from "../models/User";
import { LoyaltyTransaction } from "../models/LoyaltyTransaction";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { assignReferralCode } from "../lib/referral";
import { env } from "../config/env";

export const referralsRouter = Router();
referralsRouter.use(requireAuth);

referralsRouter.get("/", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.referralCode) {
    await assignReferralCode(user);
  }

  const referredCount = await User.countDocuments({ referredBy: req.userId });
  const pointsEarned = await LoyaltyTransaction.aggregate([
    { $match: { userId: user._id, reason: "referral_bonus" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.json({
    referralCode: user.referralCode,
    referralUrl: `${env.frontendUrl}/register?ref=${user.referralCode}`,
    referredCount,
    pointsEarned: pointsEarned[0]?.total ?? 0,
  });
});
