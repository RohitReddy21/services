"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  fetchJobSummary,
  fetchTechnicianJobs,
  type JobScope,
  type JobSummary,
} from "@/lib/api/technician-client";
import type { BookingRecord } from "@/types/booking";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRows } from "@/components/admin/panel-shell";
import TechnicianHeader from "@/components/technician/technician-header";
import JobCard from "@/components/technician/job-card";
import { cn } from "@/lib/utils";

const TABS: { id: JobScope; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Done" },
];

const EMPTY_COPY: Record<JobScope, string> = {
  today: "No jobs booked for today. Enjoy the quiet one.",
  upcoming: "Nothing scheduled yet — new jobs will appear here once the office assigns them.",
  completed: "Completed jobs will be listed here.",
};

export default function TechnicianPortal({ engineerName }: { engineerName: string }) {
  const [scope, setScope] = useState<JobScope>("today");
  const [jobs, setJobs] = useState<BookingRecord[] | null>(null);
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setRefreshing(true);
    setError(null);
    return Promise.all([fetchTechnicianJobs(scope), fetchJobSummary()])
      .then(([res, counts]) => {
        setJobs(res.jobs);
        setSummary(counts);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your jobs."))
      .finally(() => setRefreshing(false));
  }, [scope]);

  // Deferred a frame so the loading flags aren't set synchronously during the
  // effect (matches the pattern used elsewhere in the app).
  useEffect(() => {
    const raf = requestAnimationFrame(() => load());
    return () => cancelAnimationFrame(raf);
  }, [load]);

  return (
    <>
      <TechnicianHeader engineerName={engineerName} />

      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-extrabold text-navy-900">
              Hi {engineerName.split(" ")[0]}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {summary?.today
                ? `${summary.today} job${summary.today === 1 ? "" : "s"} on today`
                : "Nothing on today"}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="ags-focus inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
            aria-label="Refresh jobs"
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          </button>
        </div>

        <nav className="mt-4 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {TABS.map((tab) => {
            const active = scope === tab.id;
            const count = summary?.[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === scope) return;
                  setJobs(null); // show the skeleton while the new tab loads
                  setScope(tab.id);
                }}
                className={cn(
                  "ags-focus flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-bold transition-colors",
                  active ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[11px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {!jobs ? (
            <SkeletonRows rows={3} />
          ) : jobs.length === 0 ? (
            <EmptyState message={EMPTY_COPY[scope]} variant="card" />
          ) : (
            jobs.map((job) => <JobCard key={job.bookingReference} job={job} />)
          )}
        </div>
      </main>
    </>
  );
}
