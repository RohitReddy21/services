"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  FORM_STEP_COUNT,
  STEP_LABELS,
  useBooking,
} from "@/components/booking/booking-context";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface StepShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  canContinue: boolean;
  onContinue?: () => void | Promise<unknown>;
  continueLabel?: string;
  loading?: boolean;
  hideBack?: boolean;
}

export default function StepShell({
  title,
  description,
  children,
  canContinue,
  onContinue,
  continueLabel,
  loading = false,
  hideBack = false,
}: StepShellProps) {
  const { goBack, goNext, step, error } = useBooking();
  const currentStepNumber = Math.min(step + 1, FORM_STEP_COUNT);
  const stageProgress = (currentStepNumber / STEP_LABELS.length) * 100;
  const resolvedContinueLabel =
    continueLabel ?? (step === FORM_STEP_COUNT - 2 ? "Review Booking" : "Continue");

  const handleContinue = async () => {
    if (onContinue) {
      await onContinue();
    } else {
      goNext();
    }
  };

  return (
    <div>
      <header className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white shadow-sm shadow-brand-500/25">
              {currentStepNumber}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                {STEP_LABELS[step]}
              </p>
            <h2 className="mt-2 font-display text-lg font-extrabold text-navy-900 sm:text-xl">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-500">
                {description}
              </p>
            )}
            </div>
          </div>
          <span className="inline-flex w-fit rounded-lg border border-slate-200 bg-slate-25 px-3 py-1.5 text-xs font-bold text-slate-500">
            Step {currentStepNumber} of {STEP_LABELS.length}
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${stageProgress}%` }}
          />
        </div>
      </header>

      <div className="mt-6">{children}</div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        {!hideBack && step > 0 ? (
          <Button type="button" variant="secondary" onClick={goBack} disabled={loading}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className="min-w-36"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {resolvedContinueLabel}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
