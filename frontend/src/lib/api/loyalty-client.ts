import type { LoyaltyReward, LoyaltyTransaction } from "@/types/loyalty";
import { API_BASE_URL } from "@/lib/api/api-base";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

export function fetchLoyaltyAccount() {
  return fetch(`${API_BASE_URL}/api/loyalty`, { credentials: "include" }).then((res) =>
    json<{ balance: number; rewards: LoyaltyReward[]; transactions: LoyaltyTransaction[] }>(res)
  );
}

export function redeemLoyaltyRewardRequest(rewardId: string) {
  return fetch(`${API_BASE_URL}/api/loyalty/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rewardId }),
  }).then((res) => json<{ transaction: LoyaltyTransaction; balance: number }>(res));
}
