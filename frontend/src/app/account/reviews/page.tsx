import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/server/current-user";
import { serverFetchJson } from "@/lib/server/backend-fetch";
import { mapBookingDoc } from "@/lib/api/booking-mapper";
import ReviewForm from "@/components/account/review-form";
import type { Review } from "@/types/account";

export const metadata: Metadata = {
  title: "My Reviews",
};

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [reviewsRes, bookingsRes] = await Promise.all([
    serverFetchJson<{ reviews: Review[] }>("/api/reviews"),
    serverFetchJson<{ bookings: Record<string, unknown>[] }>("/api/bookings?mine=true"),
  ]);

  const reviews = reviewsRes?.reviews ?? [];
  const bookings = (bookingsRes?.bookings ?? []).map(mapBookingDoc);
  const reviewedReferences = new Set(reviews.map((r) => r.bookingReference));
  const reviewable = bookings.filter(
    (b) => b.status === "COMPLETED" && !reviewedReferences.has(b.bookingReference)
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        My Reviews
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Share feedback on your completed services.
      </p>

      {reviewable.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-base font-bold text-navy-900">Awaiting Your Review</h2>
          <div className="mt-3 space-y-3">
            {reviewable.map((b) => (
              <ReviewForm
                key={b.bookingReference}
                bookingReference={b.bookingReference}
                serviceName={b.data.equipmentLabel ?? "Service"}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-base font-bold text-navy-900">Your Reviews</h2>
        <div className="mt-3 space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Star className="mx-auto size-6 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">
                No reviews yet — you can review a service once it&apos;s completed.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-accent-gold-500 text-accent-gold-500" />
                  ))}
                </div>
                <p className="mt-1.5 text-sm font-semibold text-navy-900">{review.serviceName}</p>
                {review.text && <p className="mt-1 text-sm text-slate-600">{review.text}</p>}
                <p className="mt-2 text-[11px] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
