"use client";

import { Check, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { statusMeta, statusTimeline } from "@/lib/data/booking-status";
import type { BookingStatus } from "@/types/service";
import { cn } from "@/lib/utils";

export default function BookingTimeline({
  status,
  history = [],
}: {
  status: BookingStatus;
  /** Real timestamps per status, so each step can show when it happened. */
  history?: { status: BookingStatus; at: string }[];
}) {
  const reducedMotion = useReducedMotion();
  const reachedAt = new Map(history.map((entry) => [entry.status, entry.at]));

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <X className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-red-700">Booking Cancelled</p>
          <p className="text-xs text-red-500">This booking is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIndex = statusTimeline.indexOf(status);

  return (
    <ol className="space-y-0">
      {statusTimeline.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === statusTimeline.length - 1;

        return (
          <motion.li
            key={step}
            className="relative flex gap-3.5 pb-6 last:pb-0"
            initial={reducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: index * 0.06, ease: "easeOut" }}
          >
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-full w-0.5",
                  isDone ? "bg-accent-green-400" : "bg-slate-200"
                )}
              />
            )}
            <span
              className={cn(
                "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                isDone && "border-accent-green-500 bg-accent-green-500 text-white",
                isCurrent && "border-brand-600 bg-brand-600 text-white",
                !isDone && !isCurrent && "border-slate-200 bg-white text-slate-300"
              )}
            >
              {isDone ? <Check className="size-4" /> : index + 1}
            </span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isCurrent ? "text-navy-900" : isDone ? "text-navy-700" : "text-slate-400"
                )}
              >
                {statusMeta[step].label}
              </p>
              {reachedAt.has(step) ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(reachedAt.get(step)!).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                isCurrent && (
                  <p className="mt-0.5 text-xs text-slate-500">This is the current status.</p>
                )
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
