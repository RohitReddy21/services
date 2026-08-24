"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelBookingRequest, requestRescheduleRequest } from "@/lib/api/account-client";
import type { BookingStatus } from "@/types/service";

export default function BookingActions({
  bookingReference,
  status,
  rescheduleRequested,
}: {
  bookingReference: string;
  status: BookingStatus;
  rescheduleRequested: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "cancel-confirm" | "reschedule-form">("idle");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = status !== "CANCELLED" && status !== "COMPLETED";
  if (!canManage) return null;

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await cancelBookingRequest(bookingReference);
      router.refresh();
      setMode("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestRescheduleRequest(bookingReference, note);
      router.refresh();
      setMode("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "cancel-confirm") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">Cancel this booking?</p>
        <p className="mt-1 text-xs text-red-600">This can&apos;t be undone.</p>
        {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMode("idle")} disabled={loading}>
            Keep Booking
          </Button>
          <Button
            size="sm"
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Yes, Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "reschedule-form") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-25 p-4">
        <p className="text-sm font-semibold text-navy-800">Request a Reschedule</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Let us know your preferred new date or time..."
          className="input-field mt-2"
        />
        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMode("idle")} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleReschedule} disabled={loading}>
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Send Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setMode("reschedule-form")}
        disabled={rescheduleRequested}
      >
        {rescheduleRequested ? "Reschedule Requested" : "Request Reschedule"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("cancel-confirm")}
        className="text-red-600 hover:bg-red-50"
      >
        Cancel Request
      </Button>
    </div>
  );
}
