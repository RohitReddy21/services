"use client";

import { Refrigerator, Snowflake, Zap } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import FadeInImage from "@/components/ui/fade-in-image";
import { serviceCategories } from "@/lib/data/services";
import { cn } from "@/lib/utils";

const icons = { snowflake: Snowflake, fridge: Refrigerator, bolt: Zap } as const;
const categoryImages = {
  "air-conditioning": "/images/services/wall-mounted-ac.png",
  refrigeration: "/images/services/commercial-refrigeration.png",
  electrical: "/images/services/electrical-installation.png",
} as const;

export default function StageService() {
  const { form, setField } = useBooking();

  return (
    <StepShell
      title="Select Service"
      description="Choose the category that best matches your requirement."
      canContinue={!!form.categoryId}
      hideBack
    >
      <div className="grid gap-4">
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
                "ags-focus relative grid min-h-36 overflow-hidden rounded-lg border p-5 text-left transition-all sm:grid-cols-[minmax(0,1fr)_180px] sm:gap-5",
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-sm shadow-brand-100"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
              )}
            >
              <span className="flex min-w-0 items-center gap-5">
                <span
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-white text-brand-600" : "bg-slate-50 text-slate-500"
                  )}
                >
                  <Icon className="size-8" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-navy-900">{category.name}</span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">
                    {category.shortDescription}
                  </span>
                </span>
              </span>
              <span className="relative mt-4 hidden h-28 overflow-hidden rounded-lg bg-slate-100 sm:mt-0 sm:block">
                <FadeInImage
                  src={categoryImages[category.id]}
                  alt={`${category.name} service`}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </span>
              <span
                className={cn(
                  "absolute right-4 top-4 flex size-5 items-center justify-center rounded-full border",
                  isSelected ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"
                )}
              >
                {isSelected && <span className="size-2 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 rounded-lg border border-brand-100 bg-sky-50 px-4 py-3 text-xs font-semibold text-navy-700">
        Trusted by customers across the UK. Every future date and listed time
        slot is available.
      </div>
    </StepShell>
  );
}
