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
    leaderboardOptIn: user.referralLeaderboardOptIn ?? false,
  });
});

function displayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "Someone";
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1].charAt(0).toUpperCase()}.` : "";
  return lastInitial ? `${first} ${lastInitial}` : first;
}

/**
 * Top referrers, opt-in only. Never exposes email or full name — first name
 * plus last initial only, computed server-side.
 */
referralsRouter.get("/leaderboard", async (req, res) => {
  // Rank a generous candidate pool by referral count first, then drop anyone
  // who hasn't opted in — filtering before ranking would need a $lookup just
  // to check one boolean, so this is simpler and still correct as long as the
  // pool is comfortably larger than the 20 we'll actually show.
  const rows = await User.aggregate<{ _id: unknown; count: number }>([
    { $match: { referredBy: { $ne: null } } },
    { $group: { _id: "$referredBy", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 200 },
  ]);

  const referrerIds = rows.map((r) => r._id);
  const referrers = await User.find({
    _id: { $in: referrerIds },
    referralLeaderboardOptIn: true,
    deletedAt: null,
  }).select("name");
  const referrerById = new Map(referrers.map((u) => [String(u._id), u]));

  const leaderboard = rows
    .filter((r) => referrerById.has(String(r._id)))
    .slice(0, 20)
    .map((r, index) => {
      const user = referrerById.get(String(r._id))!;
      return {
        rank: index + 1,
        displayName: displayName(user.name),
        referredCount: r.count,
        isMe: String(r._id) === String(req.userId),
      };
    });

  res.json({ leaderboard });
});
