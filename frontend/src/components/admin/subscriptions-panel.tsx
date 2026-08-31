"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader2, Send } from "lucide-react";
import {
  fetchAdminSubscriptions,
  sendSubscriptionInvoiceRequest,
} from "@/lib/api/admin-client";
import { API_BASE_URL } from "@/lib/api/api-base";
import type { Subscription } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPills } from "@/components/ui/filter-pills";
import { PanelHeader, SkeletonRows } from "@/components/admin/panel-shell";

const STATUS_TONES: Record<Subscription["status"], BadgeTone> = {
  ACTIVE: "success",
  PAUSED: "warning",
  CANCELLED: "neutral",
};

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "CANCELLED", label: "Cancelled" },
];

type SendState = { loading: boolean; msg: string; tone: "ok" | "err" | "muted" };

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export default function SubscriptionsPanel() {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [filter, setFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sendState, setSendState] = useState<Record<string, SendState>>({});

  const load = useCallback(
    () => fetchAdminSubscriptions(filter || undefined).then((res) => setSubscriptions(res.subscriptions)),
    [filter]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const list = subscriptions ?? [];
    let active = 0;
    let paused = 0;
    let mrr = 0;
    for (const s of list) {
      if (s.status === "ACTIVE") {
        active += 1;
        const amount = s.price?.amount ?? 0;
        const months = s.price?.billingCycleMonths ?? 1;
        mrr += months > 0 ? amount / months : amount;
      } else if (s.status === "PAUSED") {
        paused += 1;
      }
    }
    return { active, paused, mrr: Math.round(mrr * 100) / 100 };
  }, [subscriptions]);

  const sendInvoice = async (id: string) => {
    setSendState((s) => ({ ...s, [id]: { loading: true, msg: "", tone: "muted" } }));
    try {
      const res = await sendSubscriptionInvoiceRequest(id);
      const msg =
        res.status === "sent"
          ? `Invoice ${res.invoiceNumber} emailed to ${res.to}`
          : res.status === "logged"
            ? `Invoice ${res.invoiceNumber} generated — email logged (no mail provider configured)`
            : "Couldn't send the invoice email. Try again.";
      setSendState((s) => ({
        ...s,
        [id]: { loading: false, msg, tone: res.status === "failed" ? "err" : "ok" },
      }));
    } catch (err) {
      setSendState((s) => ({
        ...s,
        [id]: {
          loading: false,
          msg: err instanceof Error ? err.message : "Something went wrong.",
          tone: "err",
        },
      }));
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Care Plans"
        subtitle="Subscriptions, billing and invoices"
        count={subscriptions?.length}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Monthly revenue", value: gbp(summary.mrr) },
          { label: "Active plans", value: summary.active },
          { label: "Paused", value: summary.paused },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 ags-depth-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 font-display text-xl font-extrabold text-navy-900">{s.value}</p>
          </div>
        ))}
      </div>

      <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      {!subscriptions ? (
        <SkeletonRows />
      ) : subscriptions.length === 0 ? (
        <EmptyState message="No Care Plan subscriptions match this filter." variant="card" />
      ) : (
        <div className="space-y-3">
          {subscriptions.map((s) => {
            const state = sendState[s.id];
            const billable = Boolean(s.price?.amount);
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-navy-900">{s.planName}</p>
                      <StatusBadge tone={STATUS_TONES[s.status]} size="sm">
                        {s.status}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-slate-500">{s.equipmentLabel}</p>
                    <p className="text-xs text-slate-400">
                      {s.address.houseNumber} {s.address.street}, {s.address.city}, {s.address.postcode}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Next visit: {new Date(s.nextVisitDate).toLocaleDateString("en-GB")}
                    </p>
                    {billable && (
                      <p className="mt-1 text-xs font-semibold text-brand-700">
                        &pound;{s.price?.amount} / {s.price?.billingCycleMonths} months
                        {s.couponCode && s.originalAmount ? (
                          <span className="ml-1 font-normal text-slate-400">
                            (was &pound;{s.originalAmount}, coupon {s.couponCode})
                          </span>
                        ) : null}
                      </p>
                    )}
                  </div>
                </div>

                {billable && (
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-3">
                    <a
                      href={`${API_BASE_URL}/api/admin/subscriptions/${s.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ags-focus inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      <FileText className="size-3.5" />
                      Preview invoice
                    </a>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={state?.loading}
                      onClick={() => sendInvoice(s.id)}
                    >
                      {state?.loading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      Email invoice to customer
                    </Button>
                    {state?.msg && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          state.tone === "err"
                            ? "text-red-600"
                            : state.tone === "ok"
                              ? "text-accent-green-700"
                              : "text-slate-500"
                        }`}
                      >
                        {state.tone === "ok" && <CheckCircle2 className="size-3.5" />}
                        {state.msg}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
