import { User } from "../models/User";
import { LoyaltyTransaction } from "../models/LoyaltyTransaction";
import { generateShortCode } from "./codes";

export const LOYALTY_REWARDS = [
  {
    id: "credit-10",
    label: "€10 Service Credit",
    description: "Redeemable against any future AGS booking or Care Plan cycle.",
    cost: 200,
  },
  {
    id: "credit-25",
    label: "€25 Service Credit",
    description: "Redeemable against any future AGS booking or Care Plan cycle.",
    cost: 450,
  },
  {
    id: "priority-callout",
    label: "Priority Callout Upgrade",
    description: "Jump the queue on your next booking's scheduling.",
    cost: 100,
  },
] as const;

export type LoyaltyRewardId = (typeof LOYALTY_REWARDS)[number]["id"];

export async function awardLoyaltyPoints(input: {
  userId: string;
  amount: number;
  reason: string;
  description?: string;
}) {
  const user = await User.findByIdAndUpdate(
    input.userId,
    { $inc: { loyaltyPoints: input.amount } },
    { new: true }
  );
  if (!user) return null;

  await LoyaltyTransaction.create({
    userId: input.userId,
    type: "EARN",
    amount: input.amount,
    balanceAfter: user.loyaltyPoints,
    reason: input.reason,
    description: input.description ?? "",
  });

  return user;
}

export async function redeemLoyaltyReward(userId: string, rewardId: LoyaltyRewardId) {
  const reward = LOYALTY_REWARDS.find((r) => r.id === rewardId);
  if (!reward) throw new Error("Unknown reward");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.loyaltyPoints < reward.cost) throw new Error("Not enough points for this reward");

  user.loyaltyPoints -= reward.cost;
  await user.save();

  const voucherCode = generateShortCode();
  const transaction = await LoyaltyTransaction.create({
    userId,
    type: "REDEEM",
    amount: reward.cost,
    balanceAfter: user.loyaltyPoints,
    reason: reward.id,
    description: reward.label,
    voucherCode,
  });

  return { transaction, balance: user.loyaltyPoints };
}
