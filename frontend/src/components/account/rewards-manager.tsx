"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchLoyaltyAccount, redeemLoyaltyRewardRequest } from "@/lib/api/loyalty-client";
import type { LoyaltyReward, LoyaltyTransaction } from "@/types/loyalty";

export default function RewardsManager() {
  const [balance, setBalance] = useState<number | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const load = () =>
    fetchLoyaltyAccount().then((res) => {
      setBalance(res.balance);
      setRewards(res.rewards);
      setTransactions(res.transactions);
    });

  useEffect(() => {
    load();
  }, []);

  const handleRedeem = async (rewardId: string) => {
    setError(null);
    setRedeeming(rewardId);
    try {
      await redeemLoyaltyRewardRequest(rewardId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRedeeming(null);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
  };

  if (balance === null) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Your balance</p>
          <p className="font-display text-2xl font-extrabold text-navy-900">{balance} points</p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">{error}</p>
      )}

      <h2 className="mt-8 font-display text-base font-bold text-navy-900">Redeem Rewards</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {rewards.map((reward) => {
          const canAfford = balance >= reward.cost;
          return (
            <div key={reward.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <Gift className="size-5 text-brand-500" />
              <p className="mt-2 text-sm font-bold text-navy-900">{reward.label}</p>
              <p className="mt-1 flex-1 text-xs text-slate-500">{reward.description}</p>
              <p className="mt-3 text-xs font-semibold text-brand-700">{reward.cost} points</p>
              <Button
                size="sm"
                className="mt-3 w-full"
                disabled={!canAfford || redeeming === reward.id}
                onClick={() => handleRedeem(reward.id)}
              >
                {redeeming === reward.id && <Loader2 className="size-3.5 animate-spin" />}
                {canAfford ? "Redeem" : "Not enough points"}
              </Button>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-base font-bold text-navy-900">Activity</h2>
      {transactions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No activity yet — book a service or subscribe to a Care Plan to start earning points.
        </p>
      ) : (
        <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-navy-800">
                  {tx.description || tx.reason.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(tx.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {tx.voucherCode && (
                  <button
                    type="button"
                    onClick={() => handleCopy(tx.voucherCode as string)}
                    className="mt-1 flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700"
                  >
                    {copiedCode === tx.voucherCode ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {tx.voucherCode}
                  </button>
                )}
              </div>
              <span
                className={`shrink-0 text-sm font-bold ${
                  tx.type === "EARN" ? "text-accent-green-600" : "text-slate-500"
                }`}
              >
                {tx.type === "EARN" ? "+" : "-"}
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
