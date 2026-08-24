"use client";

import { Check } from "lucide-react";
import { STEP_LABELS, useBooking } from "@/components/booking/booking-context";
import { cn } from "@/lib/utils";

export default function BookingStepper() {
  const { step, goToStep } = useBooking();

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-1.5 sm:gap-2">
        {STEP_LABELS.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          return (
            <li key={label} className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={index > step}
                onClick={() => index < step && goToStep(index)}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-semibold transition-colors sm:text-sm",
                  isCurrent && "bg-brand-50 text-brand-700",
                  isDone && "text-accent-green-600",
                  !isCurrent && !isDone && "text-slate-400"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:size-7",
                    isCurrent && "bg-brand-600 text-white",
                    isDone && "bg-accent-green-100 text-accent-green-700",
                    !isCurrent && !isDone && "bg-slate-100 text-slate-400"
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {index < STEP_LABELS.length - 1 && (
                <span className="h-px w-3 shrink-0 bg-slate-200 sm:w-6" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
