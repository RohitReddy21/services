"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchReferralSummary } from "@/lib/api/referral-client";
import type { ReferralSummary } from "@/types/referral";

export default function ReferralManager() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralSummary().then(setSummary);
  }, []);

  if (!summary) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(summary.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 text-center">
        <Share2 className="mx-auto size-6 text-brand-600" />
        <p className="mt-3 text-sm text-slate-600">
          Share your referral link — you&apos;ll earn <strong>50 points</strong> for every friend who
          joins, and they get <strong>25 points</strong> to start.
        </p>
        <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-xl border border-brand-200 bg-white px-3 py-2.5">
          <span className="flex-1 truncate text-left text-xs font-semibold text-navy-800">
            {summary.referralUrl}
          </span>
          <Button size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Your code: {summary.referralCode}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Users className="size-4" />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-navy-900">{summary.referredCount}</p>
            <p className="text-xs text-slate-500">Friends referred</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Share2 className="size-4" />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-navy-900">{summary.pointsEarned}</p>
            <p className="text-xs text-slate-500">Points earned from referrals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
