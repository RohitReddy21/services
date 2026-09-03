"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { fetchEngineerStats, type EngineerStats } from "@/lib/api/technician-client";

function Stars({ rating, className = "size-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < Math.round(rating)
              ? `${className} fill-accent-gold-500 text-accent-gold-500`
              : `${className} text-slate-300`
          }
        />
      ))}
    </span>
  );
}

/** "How am I doing" — jobs completed and what customers said. */
export default function EngineerScorecard() {
  const [stats, setStats] = useState<EngineerStats | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchEngineerStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) return null;

  const hasReviews = stats.reviewCount > 0;

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your rating</p>
          {hasReviews ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-2xl font-extrabold text-navy-900">
                {stats.avgRating?.toFixed(1)}
              </span>
              <Stars rating={stats.avgRating ?? 0} />
              <span className="text-xs text-slate-400">({stats.reviewCount})</span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No ratings yet</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl font-extrabold text-navy-900">
            {stats.jobsCompleted}
          </p>
          <p className="text-xs text-slate-400">jobs done</p>
        </div>
      </div>

      {stats.recentReviews.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ags-focus flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-xs font-semibold text-slate-500"
          >
            <span className="flex-1">What customers said</span>
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <ul className="space-y-3 border-t border-slate-100 p-4">
              {stats.recentReviews.map((review) => (
                <li key={review.id}>
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} className="size-3" />
                    <span className="text-xs text-slate-400">{review.serviceName}</span>
                  </div>
                  {review.text && (
                    <p className="mt-1 text-sm text-slate-700">{review.text}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
