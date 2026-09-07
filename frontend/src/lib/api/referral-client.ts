import type { LeaderboardEntry, ReferralSummary } from "@/types/referral";
import { API_BASE_URL } from "@/lib/api/api-base";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

export function fetchReferralSummary() {
  return fetch(`${API_BASE_URL}/api/referrals`, { credentials: "include" }).then((res) =>
    json<ReferralSummary>(res)
  );
}

export function fetchReferralLeaderboard() {
  return fetch(`${API_BASE_URL}/api/referrals/leaderboard`, { credentials: "include" }).then((res) =>
    json<{ leaderboard: LeaderboardEntry[] }>(res)
  );
}
