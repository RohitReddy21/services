import type { ReferralSummary } from "@/types/referral";
import { API_BASE_URL } from "@/lib/api/api-base";

export function fetchReferralSummary() {
  return fetch(`${API_BASE_URL}/api/referrals`, { credentials: "include" }).then(async (res) => {
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
    return body as ReferralSummary;
  });
}
