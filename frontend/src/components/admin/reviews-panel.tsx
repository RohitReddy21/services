"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { deleteReviewRequest, fetchAdminReviews } from "@/lib/api/admin-client";
import type { Review } from "@/types/account";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRows, PanelHeader } from "@/components/admin/panel-shell";

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => fetchAdminReviews().then((res) => setReviews(res.reviews)), []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteReviewRequest(id);
      setReviews((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } finally {
      setBusyId(null);
    }
  };

  const avg =
    reviews && reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Reviews"
        subtitle={avg ? `${avg} ★ average` : "Customer feedback"}
        count={reviews?.length}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      {!reviews ? (
        <SkeletonRows />
      ) : reviews.length === 0 ? (
        <EmptyState message="No reviews yet." variant="card" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.rating
                            ? "size-3.5 fill-accent-gold-500 text-accent-gold-500"
                            : "size-3.5 text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm font-bold text-navy-900">{r.serviceName}</p>
                  {r.text && <p className="mt-1 text-sm text-slate-600">{r.text}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {r.bookingReference} · {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => handleDelete(r.id)}
                  className="ags-focus flex size-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                  aria-label="Delete review"
                >
                  {busyId === r.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
