"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useBooking } from "@/components/booking/booking-context";
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
  continueLabel = "Continue",
  loading = false,
  hideBack = false,
}: StepShellProps) {
  const { goBack, goNext, step, error } = useBooking();

  const handleContinue = async () => {
    if (onContinue) {
      await onContinue();
    } else {
      goNext();
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}

      <div className="mt-6">{children}</div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
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
          className="min-w-32"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {continueLabel}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
