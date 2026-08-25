"use client";

import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { equipmentOptions } from "@/lib/data/booking-options";
import { cn } from "@/lib/utils";

export default function StepEquipment() {
  const { form, setField } = useBooking();
  const options = form.categoryId ? equipmentOptions[form.categoryId] : [];

  return (
    <StepShell
      title="Select Service Type"
      description="Choose the equipment you need help with."
      canContinue={!!form.equipmentId}
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const isSelected = form.equipmentId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setField("equipmentId", option.id);
                setField("equipmentLabel", option.label);
              }}
              className={cn(
                "ags-focus rounded-lg border px-4 py-3.5 text-left text-sm font-semibold transition-all hover:-translate-y-0.5",
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-100"
                  : "border-slate-200 text-navy-700 hover:border-brand-200 hover:bg-slate-25 hover:shadow-sm"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
