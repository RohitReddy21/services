export interface LoyaltyReward {
  id: string;
  label: string;
  description: string;
  cost: number;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: "EARN" | "REDEEM";
  amount: number;
  balanceAfter: number;
  reason: string;
  description: string;
  voucherCode: string | null;
  createdAt: string;
}
