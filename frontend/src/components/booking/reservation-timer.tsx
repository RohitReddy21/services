"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useBooking } from "@/components/booking/booking-context";

export default function ReservationTimer() {
  const { reservation, bookingResult, setField, goToStep } = useBooking();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!reservation) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  if (!reservation || bookingResult) return null;

  const remainingMs = reservation.expiresAt - now;

  if (remainingMs <= 0) {
    return (
      <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
        <span>Your reserved time slot has expired. Please choose a new time.</span>
        <button
          type="button"
          onClick={() => {
            setField("timeSlot", null);
            goToStep(2);
          }}
          className="shrink-0 font-semibold underline"
        >
          Pick a new time
        </button>
      </div>
    );
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const isLow = remainingMs < 2 * 60 * 1000;

  return (
    <div
      className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium ${
        isLow ? "border-red-200 bg-red-50 text-red-700" : "border-accent-gold-400/40 bg-amber-50 text-amber-800"
      }`}
    >
      <Clock className="size-4" />
      Your slot is held for{" "}
      <span className="font-bold tabular-nums">
        {minutes}:{String(seconds).padStart(2, "0")}
      </span>
      - complete your booking to confirm it.
    </div>
  );
}
