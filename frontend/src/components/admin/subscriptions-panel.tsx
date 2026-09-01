"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader2, Pencil, Plus, RotateCcw, Send, Trash2 } from "lucide-react";
import {
  archiveSubscriptionRequest,
  createSubscriptionRequest,
  fetchAdminSubscriptions,
  restoreSubscriptionRequest,
  sendSubscriptionInvoiceRequest,
  updateSubscriptionRequest,
  type AdminSubscriptionInput,
} from "@/lib/api/admin-client";
import { API_BASE_URL } from "@/lib/api/api-base";
import type { ServiceCategoryId } from "@/types/service";
import type { Subscription, SubscriptionFrequency, SubscriptionStatus } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPills } from "@/components/ui/filter-pills";
import {
  AdminModal,
  ArchiveToggle,
  Field,
  FieldGrid,
  PanelHeader,
  SkeletonRows,
} from "@/components/admin/panel-shell";

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

const FREQUENCIES: SubscriptionFrequency[] = [
  "monthly",
  "quarterly",
  "quarterly-bundle",
  "bi-annual",
  "annual",
];
const CATEGORIES: ServiceCategoryId[] = ["air-conditioning", "refrigeration", "electrical"];
const STATUSES: SubscriptionStatus[] = ["ACTIVE", "PAUSED", "CANCELLED"];

type SendState = { loading: boolean; msg: string; tone: "ok" | "err" | "muted" };

type FormState = {
  userId: string;
  planId: string;
  planName: string;
  frequency: SubscriptionFrequency;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  status: SubscriptionStatus;
  houseNumber: string;
  street: string;
  city: string;
  postcode: string;
  notes: string;
  priceAmount: string;
  billingCycleMonths: string;
  startDate: string;
  nextVisitDate: string;
};

const emptyForm: FormState = {
  userId: "",
  planId: "",
  planName: "",
  frequency: "quarterly",
  categoryId: "air-conditioning",
  equipmentId: "",
  equipmentLabel: "",
  status: "ACTIVE",
  houseNumber: "",
  street: "",
  city: "",
  postcode: "",
  notes: "",
  priceAmount: "",
  billingCycleMonths: "3",
  startDate: "",
  nextVisitDate: "",
};

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

function toPayload(f: FormState): Omit<AdminSubscriptionInput, "userId"> & { userId?: string } {
  const amount = Number(f.priceAmount);
  return {
    userId: f.userId.trim() || undefined,
    planId: f.planId.trim(),
    planName: f.planName.trim(),
    frequency: f.frequency,
    categoryId: f.categoryId,
    equipmentId: f.equipmentId.trim(),
    equipmentLabel: f.equipmentLabel.trim(),
    status: f.status,
    address: {
      houseNumber: f.houseNumber.trim(),
      street: f.street.trim(),
      city: f.city.trim(),
      postcode: f.postcode.trim(),
    },
    notes: f.notes.trim(),
    price:
      f.priceAmount && amount > 0
        ? { amount, currency: "GBP", billingCycleMonths: Number(f.billingCycleMonths) || 1 }
        : null,
    startDate: f.startDate || undefined,
    nextVisitDate: f.nextVisitDate || undefined,
  };
}

export default function SubscriptionsPanel() {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [filter, setFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sendState, setSendState] = useState<Record<string, SendState>>({});

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      fetchAdminSubscriptions({
        status: filter || undefined,
        includeArchived: showArchived,
      }).then((res) => setSubscriptions(res.subscriptions)),
    [filter, showArchived]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const list = (subscriptions ?? []).filter((s) => !s.deletedAt);
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

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setError(null);
    setEditId(null);
    setForm(emptyForm);
    setShowCreate(true);
  };

  const openEdit = (s: Subscription) => {
    setError(null);
    setEditId(s.id);
    setForm({
      userId: s.userId,
      planId: s.planId,
      planName: s.planName,
      frequency: s.frequency,
      categoryId: s.categoryId,
      equipmentId: s.equipmentId,
      equipmentLabel: s.equipmentLabel,
      status: s.status,
      houseNumber: s.address.houseNumber,
      street: s.address.street,
      city: s.address.city,
      postcode: s.address.postcode,
      notes: s.notes,
      priceAmount: s.price?.amount != null ? String(s.price.amount) : "",
      billingCycleMonths: s.price?.billingCycleMonths != null ? String(s.price.billingCycleMonths) : "3",
      startDate: s.startDate ? s.startDate.slice(0, 10) : "",
      nextVisitDate: s.nextVisitDate ? s.nextVisitDate.slice(0, 10) : "",
    });
    setShowCreate(true);
  };

  const submitForm = async () => {
    const payload = toPayload(form);
    if (!editId && !payload.userId) {
      setError("A customer ID is required to create a subscription.");
      return;
    }
    if (!payload.planName || !payload.planId || !payload.equipmentLabel) {
      setError("Plan ID, plan name and equipment label are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        const { userId: _userId, ...patch } = payload;
        void _userId;
        await updateSubscriptionRequest(editId, patch);
      } else {
        await createSubscriptionRequest(payload as AdminSubscriptionInput);
      }
      setShowCreate(false);
      setForm(emptyForm);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the subscription.");
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (s: Subscription) => {
    setBusyId(s.id);
    setError(null);
    try {
      if (s.deletedAt) await restoreSubscriptionRequest(s.id);
      else await archiveSubscriptionRequest(s.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the subscription.");
    } finally {
      setBusyId(null);
    }
  };

  const quickStatus = async (s: Subscription, status: SubscriptionStatus) => {
    setBusyId(s.id);
    setError(null);
    try {
      await updateSubscriptionRequest(s.id, { status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change status.");
    } finally {
      setBusyId(null);
    }
  };

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
        actions={
          <div className="flex items-center gap-2">
            <ArchiveToggle value={showArchived} onChange={setShowArchived} />
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
        }
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

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

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
                className={`rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm ${
                  s.deletedAt ? "opacity-55" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-navy-900">{s.planName}</p>
                      <StatusBadge tone={STATUS_TONES[s.status]} size="sm">
                        {s.status}
                      </StatusBadge>
                      {s.deletedAt && (
                        <StatusBadge tone="neutral" size="sm">
                          Archived
                        </StatusBadge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {s.equipmentLabel} · {s.frequency}
                    </p>
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

                  <div className="flex shrink-0 items-center gap-1">
                    <select
                      value={s.status}
                      disabled={busyId === s.id || Boolean(s.deletedAt)}
                      onChange={(e) => quickStatus(s, e.target.value as SubscriptionStatus)}
                      className="input-field h-8 w-auto text-xs"
                      aria-label="Status"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      disabled={busyId === s.id}
                      className="ags-focus flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700 disabled:opacity-50"
                      aria-label="Edit subscription"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArchive(s)}
                      disabled={busyId === s.id}
                      className={`ags-focus flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                        s.deletedAt ? "text-brand-600 hover:bg-brand-50" : "text-red-500 hover:bg-red-50"
                      }`}
                      aria-label={s.deletedAt ? "Restore subscription" : "Archive subscription"}
                    >
                      {busyId === s.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : s.deletedAt ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {billable && !s.deletedAt && (
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

      {showCreate && (
        <AdminModal
          title={editId ? "Edit Care Plan" : "New Care Plan"}
          wide
          onClose={() => {
            setShowCreate(false);
            setEditId(null);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setEditId(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={submitForm} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save changes" : "Create plan"}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            {!editId && (
              <Field label="Customer ID" hint="The user's account ID this plan belongs to.">
                <input
                  className="input-field h-9 text-sm"
                  value={form.userId}
                  onChange={(e) => set("userId", e.target.value)}
                />
              </Field>
            )}
            <FieldGrid>
              <Field label="Plan ID">
                <input
                  className="input-field h-9 text-sm"
                  value={form.planId}
                  onChange={(e) => set("planId", e.target.value)}
                />
              </Field>
              <Field label="Plan name">
                <input
                  className="input-field h-9 text-sm"
                  value={form.planName}
                  onChange={(e) => set("planName", e.target.value)}
                />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Frequency">
                <select
                  className="input-field h-9 text-sm"
                  value={form.frequency}
                  onChange={(e) => set("frequency", e.target.value as SubscriptionFrequency)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="input-field h-9 text-sm"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as SubscriptionStatus)}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Category">
                <select
                  className="input-field h-9 text-sm"
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value as ServiceCategoryId)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Equipment ID">
                <input
                  className="input-field h-9 text-sm"
                  value={form.equipmentId}
                  onChange={(e) => set("equipmentId", e.target.value)}
                />
              </Field>
            </FieldGrid>
            <Field label="Equipment label">
              <input
                className="input-field h-9 text-sm"
                value={form.equipmentLabel}
                onChange={(e) => set("equipmentLabel", e.target.value)}
              />
            </Field>
            <FieldGrid>
              <Field label="House number">
                <input
                  className="input-field h-9 text-sm"
                  value={form.houseNumber}
                  onChange={(e) => set("houseNumber", e.target.value)}
                />
              </Field>
              <Field label="Street">
                <input
                  className="input-field h-9 text-sm"
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
              </Field>
              <Field label="City">
                <input
                  className="input-field h-9 text-sm"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>
              <Field label="Postcode">
                <input
                  className="input-field h-9 text-sm"
                  value={form.postcode}
                  onChange={(e) => set("postcode", e.target.value)}
                />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Price amount (£)" hint="Leave blank for a quote-only plan.">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input-field h-9 text-sm"
                  value={form.priceAmount}
                  onChange={(e) => set("priceAmount", e.target.value)}
                />
              </Field>
              <Field label="Billing cycle (months)">
                <input
                  type="number"
                  min={1}
                  className="input-field h-9 text-sm"
                  value={form.billingCycleMonths}
                  onChange={(e) => set("billingCycleMonths", e.target.value)}
                />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Start date">
                <input
                  type="date"
                  className="input-field h-9 text-sm"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </Field>
              <Field label="Next visit date">
                <input
                  type="date"
                  className="input-field h-9 text-sm"
                  value={form.nextVisitDate}
                  onChange={(e) => set("nextVisitDate", e.target.value)}
                />
              </Field>
            </FieldGrid>
            <Field label="Notes">
              <textarea
                className="input-field min-h-16 text-sm"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
