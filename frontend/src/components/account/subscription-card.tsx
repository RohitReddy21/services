"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, MapPin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cancelSubscriptionRequest,
  pauseSubscriptionRequest,
  resumeSubscriptionRequest,
} from "@/lib/api/subscription-client";
import type { Subscription } from "@/types/subscription";

const statusMeta: Record<Subscription["status"], { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Active", bg: "bg-accent-green-50", color: "text-accent-green-700" },
  PAUSED: { label: "Paused", bg: "bg-amber-50", color: "text-amber-700" },
  CANCELLED: { label: "Cancelled", bg: "bg-slate-100", color: "text-slate-500" },
};

const frequencyLabel: Record<Subscription["frequency"], string> = {
  quarterly: "Quarterly",
  "quarterly-bundle": "3-Month Bundle",
  "bi-annual": "Bi-Annual",
  annual: "Annual",
};

export default function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const meta = statusMeta[subscription.status];

  const run = async (fn: (id: string) => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn(subscription.id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const fullAddress = [
    subscription.address.houseNumber,
    subscription.address.street,
    subscription.address.city,
    subscription.address.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {frequencyLabel[subscription.frequency]} Plan
          </p>
          <h3 className="mt-0.5 font-display text-base font-bold text-navy-900">
            {subscription.planName} &middot; {subscription.equipmentLabel}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {subscription.status === "CANCELLED"
            ? "Subscription ended"
            : `Next visit: ${new Date(subscription.nextVisitDate).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })} (estimated)`}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {fullAddress}
        </span>
      </div>

      {subscription.status !== "CANCELLED" && (
        <div className="mt-4 flex flex-wrap gap-2.5 border-t border-slate-100 pt-4">
          {subscription.status === "ACTIVE" ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => run(pauseSubscriptionRequest)}
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              Pause Plan
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => run(resumeSubscriptionRequest)}
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              <RotateCcw className="size-3.5" />
              Resume Plan
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => run(cancelSubscriptionRequest)}
            className="text-red-600 hover:bg-red-50"
          >
            Cancel Plan
          </Button>
        </div>
      )}
    </div>
  );
}
