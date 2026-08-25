"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelBookingRequest, rescheduleBookingRequest } from "@/lib/api/account-client";
import { fetchDaySlots } from "@/lib/api/booking-client";
import type { BookingStatus } from "@/types/service";
import type { SlotGroup, TimeSlot } from "@/types/booking";
import { cn } from "@/lib/utils";

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookingActions({
  bookingReference,
  status,
  categoryId,
  equipmentId,
}: {
  bookingReference: string;
  status: BookingStatus;
  categoryId: string;
  equipmentId: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "cancel-confirm" | "reschedule-form">("idle");
  const [date, setDate] = useState("");
  const [groups, setGroups] = useState<SlotGroup[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
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

  const loadSlots = async (nextDate: string) => {
    setDate(nextDate);
    setSelectedSlot(null);
    if (!nextDate) {
      setGroups(null);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await fetchDaySlots(nextDate, categoryId, equipmentId);
      setGroups(res.groups);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!date || !selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      await rescheduleBookingRequest(bookingReference, date, selectedSlot);
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
        <p className="text-sm font-semibold text-navy-800">Choose a New Date &amp; Time</p>
        <input
          type="date"
          min={tomorrowISO()}
          value={date}
          onChange={(e) => loadSlots(e.target.value)}
          className="input-field mt-2"
        />

        {loadingSlots && (
          <div className="mt-3 flex h-20 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-brand-500" />
          </div>
        )}

        {!loadingSlots && groups && (
          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <div key={group.period}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {group.period}
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {group.slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "ags-focus rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors",
                        !slot.available && "cursor-not-allowed border-slate-100 text-slate-300 line-through",
                        slot.available &&
                          selectedSlot?.id !== slot.id &&
                          "border-slate-200 bg-white text-navy-700 hover:border-brand-200",
                        selectedSlot?.id === slot.id && "border-brand-500 bg-brand-50 text-brand-700"
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

        <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMode("idle")} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleReschedule} disabled={loading || !selectedSlot}>
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Confirm New Time
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button variant="secondary" size="sm" onClick={() => setMode("reschedule-form")}>
        Reschedule Booking
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("cancel-confirm")}
        className="text-red-600 hover:bg-red-50"
      >
        Cancel Booking
      </Button>
    </div>
  );
}
