"use client";

import { Check, Refrigerator, Snowflake } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { serviceCategories } from "@/lib/data/services";
import { cn } from "@/lib/utils";

const icons = { snowflake: Snowflake, fridge: Refrigerator } as const;

export default function StepCategory() {
  const { form, setField } = useBooking();

  return (
    <StepShell
      title="Select a Service Category"
      description="Please choose the category that best matches your requirement."
      canContinue={!!form.categoryId}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {serviceCategories.map((category) => {
          const Icon = icons[category.icon];
          const isSelected = form.categoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setField("categoryId", category.id);
                setField("equipmentId", null);
                setField("equipmentLabel", null);
              }}
              className={cn(
                "ags-focus relative rounded-lg border p-5 text-left transition-all",
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-sm shadow-brand-100"
                  : "border-slate-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-slate-25 hover:shadow-sm"
              )}
            >
              <span
                className={cn(
                  "absolute right-4 top-4 flex size-6 items-center justify-center rounded-lg border",
                  isSelected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 bg-white text-transparent"
                )}
              >
                <Check className="size-3.5" />
              </span>
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-lg",
                  isSelected ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                )}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-navy-900">
                {category.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {category.shortDescription}
              </p>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
