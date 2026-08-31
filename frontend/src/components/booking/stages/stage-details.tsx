"use client";

import { Camera, Check } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { equipmentOptions, requirementOptions } from "@/lib/data/booking-options";
import StepPhotos from "@/components/booking/steps/step-photos";
import FadeInImage from "@/components/ui/fade-in-image";
import { cn } from "@/lib/utils";
import type { ServiceCategoryId } from "@/types/service";

const equipmentImages: Record<ServiceCategoryId, Record<string, string>> = {
  "air-conditioning": {
    "wall-mounted": "/images/services/wall-mounted-ac.png",
    cassette: "/images/services/cassette-ac.png",
    vrv: "/images/services/outdoor-condenser-units.png",
    vrf: "/images/services/outdoor-condenser-units.png",
    "multi-split": "/images/services/outdoor-condenser-units.png",
    "commercial-ac": "/images/services/outdoor-condenser-units.png",
    "residential-ac": "/images/services/wall-mounted-ac.png",
    other: "/images/services/ac-installation.png",
  },
  refrigeration: {
    fridge: "/images/services/commercial-fridge.png",
    freezer: "/images/services/commercial-freezer.png",
    "cold-room": "/images/services/cold-storage.png",
    "blast-chiller": "/images/services/cold-storage.png",
    "ice-machine": "/images/services/ice-machine.png",
    "display-fridge": "/images/services/display-fridge.png",
    "walk-in-fridge": "/images/services/commercial-refrigeration.png",
    "walk-in-freezer": "/images/services/commercial-freezer.png",
    "commercial-refrigeration": "/images/services/commercial-refrigeration.png",
    other: "/images/services/industrial-refrigeration.png",
  },
  electrical: {
    "consumer-unit": "/images/services/electrical-consumer-unit.png",
    lighting: "/images/services/electrical-lighting.png",
    "sockets-power": "/images/services/electrical-sockets.png",
    "ev-charger": "/images/services/electrical-ev-charger.png",
    rewiring: "/images/services/electrical-rewiring.png",
    "eicr-testing": "/images/services/electrical-eicr.png",
    "wiring-circuit": "/images/services/electrical-repairs.png",
    "commercial-electrical": "/images/services/electrical-commercial.png",
    other: "/images/services/electrical-installation.png",
  },
};

export default function StageDetails() {
  const { form, setField } = useBooking();
  const options = form.categoryId ? equipmentOptions[form.categoryId] : [];

  return (
    <StepShell
      title="Service Details"
      description="Select equipment, service type and optional supporting photos."
      canContinue={!!form.equipmentId && !!form.requirement}
    >
      <section>
        <h3 className="text-xs font-bold text-navy-900">Equipment / System</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
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
                  "ags-focus relative min-h-32 rounded-lg border px-3 py-3 text-center text-xs font-bold transition-all",
                  isSelected
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-100"
                    : "border-slate-200 bg-white text-navy-700 hover:border-brand-200 hover:bg-slate-25"
                )}
              >
                {isSelected && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <span className="relative mx-auto mb-2 block h-14 w-20 overflow-hidden rounded-lg bg-slate-100">
                  <FadeInImage
                    src={
                      form.categoryId
                        ? equipmentImages[form.categoryId][option.id] ??
                          "/images/services/hvac-repair-technician.png"
                        : "/images/services/hvac-repair-technician.png"
                    }
                    alt={option.label}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-xs font-bold text-navy-900">What do you need help with?</h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {requirementOptions.map((option) => {
            const isSelected = form.requirement === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setField("requirement", option.id)}
                className={cn(
                  "ags-focus rounded-lg border px-3 py-3 text-center text-xs font-bold transition-all",
                  isSelected
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-100"
                    : "border-slate-200 bg-white text-navy-700 hover:border-brand-200 hover:bg-slate-25"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <label htmlFor="description" className="text-xs font-bold text-navy-900">
          Tell us more <span className="font-medium text-slate-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Describe the issue or requirement..."
          className="mt-2 w-full rounded-lg border border-slate-200 p-3.5 text-xs text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-xs text-slate-400">{form.description.length} / 300</p>
      </section>

      <details className="mt-6 rounded-lg border border-slate-200 bg-slate-25 p-4">
        <summary className="ags-focus flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-navy-900">
          <Camera className="size-4 text-brand-600" />
          Add photos for the engineer
        </summary>
        <div className="mt-4">
          <StepPhotos embedded />
        </div>
      </details>
    </StepShell>
  );
}
