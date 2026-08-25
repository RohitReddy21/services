"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchAdminSubscriptions } from "@/lib/api/admin-client";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Subscription["status"], string> = {
  ACTIVE: "bg-accent-green-50 text-accent-green-700",
  PAUSED: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function SubscriptionsPanel() {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchAdminSubscriptions(filter || undefined).then((res) => setSubscriptions(res.subscriptions));
  }, [filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {["", "ACTIVE", "PAUSED", "CANCELLED"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              filter === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
            )}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {!subscriptions ? (
        <div className="mt-6 flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-brand-500" />
        </div>
      ) : subscriptions.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No Care Plan subscriptions match this filter.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {subscriptions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-navy-900">
                    {s.planName} &middot; {s.equipmentLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.address.houseNumber} {s.address.street}, {s.address.city}, {s.address.postcode}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Next visit: {new Date(s.nextVisitDate).toLocaleDateString("en-GB")}
                  </p>
                  {s.price?.amount && (
                    <p className="mt-1 text-xs font-semibold text-brand-700">
                      &euro;{s.price.amount} / {s.price.billingCycleMonths} months
                      {s.couponCode && s.originalAmount ? (
                        <span className="ml-1 font-normal text-slate-400">
                          (was &euro;{s.originalAmount}, coupon {s.couponCode})
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLES[s.status])}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
