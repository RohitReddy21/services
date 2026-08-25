"use client";

import { Check } from "lucide-react";
import {
  FORM_STEP_COUNT,
  STEP_LABELS,
  useBooking,
} from "@/components/booking/booking-context";
import { cn } from "@/lib/utils";

export default function BookingStepper() {
  const { step, goToStep, bookingResult } = useBooking();
  const activeIndex = bookingResult ? STEP_LABELS.length - 1 : step;

  return (
    <nav aria-label="Booking progress" className="overflow-x-auto pb-1">
      <ol className="flex min-w-[760px] items-start sm:min-w-0">
        {STEP_LABELS.map((label, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          const canVisit = index < FORM_STEP_COUNT && index <= step && !bookingResult;

          return (
            <li key={label} className="relative flex flex-1 flex-col items-center text-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-4 h-px w-1/2",
                    index <= activeIndex ? "bg-brand-500" : "bg-slate-200"
                  )}
                />
              )}
              {index < STEP_LABELS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-0 top-4 h-px w-1/2",
                    index < activeIndex ? "bg-brand-500" : "bg-slate-200"
                  )}
                />
              )}

              <button
                type="button"
                disabled={!canVisit}
                aria-current={isActive ? "step" : undefined}
                onClick={() => goToStep(index)}
                className={cn(
                  "ags-focus relative z-10 flex min-w-24 flex-col items-center gap-2 rounded-lg px-2 pb-1 text-xs font-bold transition-colors",
                  canVisit && !isActive && "text-slate-600 hover:text-brand-700",
                  isActive && "text-brand-700",
                  !canVisit && !isActive && "cursor-default text-slate-400"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border bg-white text-xs font-extrabold transition-all",
                    isActive && "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-500/25",
                    isComplete && "border-brand-600 bg-brand-600 text-white",
                    !isActive && !isComplete && "border-slate-300 text-slate-500"
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="leading-tight text-current">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
