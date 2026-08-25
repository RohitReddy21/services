"use client";

import StepDate from "@/components/booking/steps/step-date";
import StepTime from "@/components/booking/steps/step-time";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";

export default function StageDateTime() {
  const { form } = useBooking();

  return (
    <StepShell
      title="Date & Time"
      description="Choose a convenient date and appointment window."
      canContinue={!!form.date && !!form.timeSlot}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StepDate embedded />
        <StepTime embedded />
      </div>
    </StepShell>
  );
}
