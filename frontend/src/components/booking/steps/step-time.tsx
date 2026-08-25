"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { fetchDaySlots } from "@/lib/api/booking-client";
import type { SlotGroup, TimeSlot } from "@/types/booking";
import { cn } from "@/lib/utils";

export default function StepTime({ embedded = false }: { embedded?: boolean }) {
  const { form, setField, reserve } = useBooking();
  const requestKey = `${form.date ?? ""}:${form.categoryId ?? ""}:${form.equipmentId ?? ""}`;
  const [slotAvailability, setSlotAvailability] = useState<{
    key: string;
    groups: SlotGroup[];
  } | null>(null);
  const [reserving, setReserving] = useState<string | null>(null);
  const groups = slotAvailability?.key === requestKey ? slotAvailability.groups : null;
  const loading = Boolean(form.date) && groups === null;

  useEffect(() => {
    if (!form.date) return;
    let cancelled = false;
    fetchDaySlots(form.date, form.categoryId ?? "", form.equipmentId ?? "").then((res) => {
      if (!cancelled) setSlotAvailability({ key: requestKey, groups: res.groups });
    });
    return () => {
      cancelled = true;
    };
  }, [form.date, form.categoryId, form.equipmentId, requestKey]);

  const handleSelect = async (slot: TimeSlot) => {
    if (!form.date || !slot.available) return;
    setReserving(slot.id);
    const ok = await reserve(form.date, slot.id);
    setReserving(null);
    if (ok) {
      setField("timeSlot", slot);
    } else {
      fetchDaySlots(form.date, form.categoryId ?? "", form.equipmentId ?? "").then((res) =>
        setSlotAvailability({ key: requestKey, groups: res.groups })
      );
    }
  };

  const formattedDate = form.date
    ? new Date(`${form.date}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  const content = (
    <>
      {embedded && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-navy-900">Available Time Slots</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {formattedDate
              ? `Every listed time slot is available for ${formattedDate}.`
              : "Select a date to load appointment windows."}
          </p>
        </div>
      )}

      {!form.date ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-25 px-4 py-10 text-center text-xs font-semibold text-slate-500">
          Choose a date first.
        </div>
      ) : loading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <Loader2 className="size-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {groups?.map((group) => (
            <div key={group.period}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {group.period}
              </p>
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                {group.slots.map((slot) => {
                  const isSelected = form.timeSlot?.id === slot.id;
                  const isReserving = reserving === slot.id;
                  return (
                    <motion.button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available || isReserving}
                      onClick={() => handleSelect(slot)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={cn(
                        "ags-focus flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-semibold transition-all",
                        !slot.available &&
                          "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through",
                        slot.available &&
                          !isSelected &&
                          "border-slate-200 bg-white text-navy-700 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-sky-50 hover:shadow-sm",
                        isSelected &&
                          "border-brand-500 bg-brand-50 text-brand-800 shadow-md shadow-brand-100"
                      )}
                    >
                      {isReserving && <Loader2 className="size-3.5 animate-spin" />}
                      {slot.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
          {groups && groups.every((group) => group.slots.every((slot) => !slot.available)) && (
            <p className="rounded-lg border border-slate-200 bg-slate-25 px-3.5 py-3 text-xs text-slate-500">
              No slots are available on this date. Choose a different date.
            </p>
          )}
        </motion.div>
      )}
    </>
  );

  if (embedded) {
    return <section>{content}</section>;
  }

  return (
    <StepShell
      title="Select a Time Slot"
      description={formattedDate ? `Available time slots for ${formattedDate}.` : undefined}
      canContinue={!!form.timeSlot}
    >
      {content}
    </StepShell>
  );
}
