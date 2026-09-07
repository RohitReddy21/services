"use client";

import { useEffect, useState } from "react";
import { fetchEarnings, type EarningsRange, type EarningsSummary } from "@/lib/api/technician-client";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRows } from "@/components/admin/panel-shell";
import { cn } from "@/lib/utils";

const RANGES: { id: EarningsRange; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/**
 * Revenue the engineer generated on completed jobs — not a payout/commission
 * figure, since there's no pay-rate concept yet. Labelled honestly as such.
 */
export default function EarningsPanel() {
  const [range, setRange] = useState<EarningsRange>("week");
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEarnings(range)
      .then((res) => {
        if (cancelled) return;
        setSummary(res);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Couldn't load earnings.");
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  // Show the skeleton while switching ranges rather than a stale total.
  const loading = summary?.range !== range;

  return (
    <div className="space-y-4">
      <nav className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={cn(
              "ags-focus rounded-lg px-2 py-2 text-xs font-bold transition-colors",
              range === r.id ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {r.label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      {loading || !summary ? (
        <SkeletonRows rows={3} />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Revenue you generated
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-navy-900">
              {gbp(summary.total)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {summary.jobCount} completed job{summary.jobCount === 1 ? "" : "s"}
              {summary.jobsWithoutPrice > 0 &&
                ` · ${summary.jobsWithoutPrice} awaiting a price from the office`}
            </p>
          </div>

          {summary.jobs.length === 0 ? (
            <EmptyState message="No completed jobs in this range." variant="card" />
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {summary.jobs.map((job) => (
                <div
                  key={job.bookingReference}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">
                      {job.equipmentLabel}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {job.bookingReference}
                      {job.completedAt &&
                        ` · ${new Date(job.completedAt).toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold",
                      job.amount != null ? "text-navy-900" : "text-slate-400"
                    )}
                  >
                    {job.amount != null ? gbp(job.amount) : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
