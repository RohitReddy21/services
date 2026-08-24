"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReviewRequest } from "@/lib/api/account-client";
import { cn } from "@/lib/utils";

export default function ReviewForm({
  bookingReference,
  serviceName,
}: {
  bookingReference: string;
  serviceName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitReviewRequest({ bookingReference, rating, text });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-navy-900">{serviceName}</p>
      <p className="text-xs text-slate-400">{bookingReference}</p>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} stars`}
          >
            <Star
              className={cn(
                "size-6",
                n <= (hoverRating || rating)
                  ? "fill-accent-gold-500 text-accent-gold-500"
                  : "text-slate-200"
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Tell us about your experience..."
        className="input-field mt-3"
      />

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <Button size="sm" className="mt-3" onClick={handleSubmit} disabled={submitting}>
        {submitting && <Loader2 className="size-3.5 animate-spin" />}
        Submit Review
      </Button>
    </div>
  );
}
