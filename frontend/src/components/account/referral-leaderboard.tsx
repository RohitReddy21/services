"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { fetchReferralLeaderboard } from "@/lib/api/referral-client";
import type { LeaderboardEntry } from "@/types/referral";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export default function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    fetchReferralLeaderboard()
      .then((res) => setLeaderboard(res.leaderboard))
      .catch(() => setLeaderboard([]));
  }, []);

  if (!leaderboard) return null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-accent-gold-500" />
        <h3 className="font-display text-sm font-bold text-navy-900">Top referrers</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Only shows people who&apos;ve opted in to appear here.
      </p>

      {leaderboard.length === 0 ? (
        <div className="mt-4">
          <EmptyState message="No one's opted in to the leaderboard yet." />
        </div>
      ) : (
        <ol className="mt-4 divide-y divide-slate-100">
          {leaderboard.map((entry) => (
            <li
              key={entry.rank}
              className={cn(
                "flex items-center justify-between gap-3 py-2.5",
                entry.isMe && "rounded-lg bg-brand-50/60 px-2"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {entry.rank}
                </span>
                <span className="text-sm font-semibold text-navy-900">
                  {entry.displayName}
                  {entry.isMe && <span className="ml-1.5 text-xs text-brand-600">(you)</span>}
                </span>
              </div>
              <span className="text-sm font-bold text-navy-900">{entry.referredCount}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
