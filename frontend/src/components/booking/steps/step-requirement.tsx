"use client";

import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { requirementOptions } from "@/lib/data/booking-options";
import { cn } from "@/lib/utils";

export default function StepRequirement() {
  const { form, setField } = useBooking();

  return (
    <StepShell
      title="What do you need help with?"
      description="Select the type of service required."
      canContinue={!!form.requirement}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {requirementOptions.map((option) => {
          const isSelected = form.requirement === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setField("requirement", option.id)}
              className={cn(
                "ags-focus rounded-xl border-2 px-4 py-3.5 text-left transition-all hover:-translate-y-0.5",
                isSelected
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 hover:border-brand-200 hover:bg-slate-25"
              )}
            >
              <p
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-brand-700" : "text-navy-800"
                )}
              >
                {option.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label htmlFor="description" className="text-sm font-semibold text-navy-800">
          Tell us more about what you need
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="E.g. the unit is making a loud noise and isn't cooling the room properly..."
          className="mt-2 w-full rounded-xl border border-slate-200 p-3.5 text-sm text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </StepShell>
  );
}
