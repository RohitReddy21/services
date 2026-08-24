"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { fetchMonthAvailability } from "@/lib/api/booking-client";
import type { DayAvailability } from "@/types/booking";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function StepDate() {
  const { form, setField } = useBooking();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [availability, setAvailability] = useState<{
    monthKey: string;
    days: DayAvailability[];
  } | null>(null);

  const monthKey = toMonthKey(viewDate);
  const days = availability?.monthKey === monthKey ? availability.days : null;
  const loading = days === null;
  const today = useMemo(() => new Date(new Date().toDateString()), []);

  useEffect(() => {
    let cancelled = false;
    fetchMonthAvailability(monthKey, form.categoryId ?? "", form.equipmentId ?? "")
      .then((res) => {
        if (!cancelled) setAvailability({ monthKey, days: res.days });
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, form.categoryId, form.equipmentId]);

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first

  const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const canGoToPrevMonth =
    viewDate.getFullYear() > today.getFullYear() ||
    (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() > today.getMonth());

  return (
    <StepShell
      title="Select a Date"
      description="Choose a date that works for you — availability updates live."
      canContinue={!!form.date}
    >
      <div className="rounded-2xl border border-brand-100 bg-linear-to-b from-white to-sky-50 p-4 shadow-inner shadow-brand-100 sm:p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoToPrevMonth}
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-bold text-navy-900">{monthLabel}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {days?.map((day) => {
              const dateObj = new Date(day.date + "T00:00:00");
              const isPast = dateObj < today;
              const disabled = isPast || !day.hasAvailability;
              const isSelected = form.date === day.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setField("date", day.date);
                    setField("timeSlot", null);
                  }}
                  className={cn(
                    "ags-focus relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold transition-all",
                    disabled && "cursor-not-allowed bg-white/50 text-slate-300",
                    !disabled && !isSelected && "bg-white text-navy-800 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-sm",
                    isSelected && "bg-brand-100 text-brand-800 ring-2 ring-brand-500 shadow-md shadow-brand-100"
                  )}
                >
                  {dateObj.getDate()}
                  {isSelected && (
                    <span className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-accent-gold-500" />
                  )}
                  {!disabled && !isSelected && (
                    <span className="mt-0.5 size-1 rounded-full bg-accent-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-accent-green-500" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-slate-300" /> Unavailable
        </span>
      </div>
    </StepShell>
  );
}
