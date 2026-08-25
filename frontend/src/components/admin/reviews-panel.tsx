"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { fetchAdminReviews } from "@/lib/api/admin-client";
import type { Review } from "@/types/account";

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    fetchAdminReviews().then((res) => setReviews(res.reviews));
  }, []);

  if (!reviews) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-accent-gold-500 text-accent-gold-500" />
                ))}
              </div>
              <p className="mt-1 text-sm font-bold text-navy-900">{r.serviceName}</p>
              <p className="mt-1 text-sm text-slate-600">{r.text}</p>
              <p className="mt-1 text-xs text-slate-400">{r.bookingReference}</p>
            </div>
            <p className="shrink-0 text-xs text-slate-400">
              {new Date(r.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
