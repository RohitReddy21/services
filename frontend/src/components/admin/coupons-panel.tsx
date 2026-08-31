"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRows, PanelHeader } from "@/components/admin/panel-shell";
import {
  createCouponRequest,
  deleteCouponRequest,
  fetchAdminCoupons,
  updateCouponRequest,
} from "@/lib/api/admin-client";
import type { Coupon, DiscountType } from "@/types/coupon";

const emptyForm = {
  code: "",
  description: "",
  discountType: "PERCENT" as DiscountType,
  discountValue: "",
  expiresAt: "",
  maxRedemptions: "",
};

type EditDraft = {
  description: string;
  discountValue: string;
  expiresAt: string;
  maxRedemptions: string;
};

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  const load = useCallback(() => fetchAdminCoupons().then((res) => setCoupons(res.coupons)), []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discountValue) {
      setError("Code and discount value are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createCouponRequest({
        code: form.code.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        expiresAt: form.expiresAt || null,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
      });
      await load();
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Coupon) => {
    setEditId(c.id);
    setEditDraft({
      description: c.description,
      discountValue: String(c.discountValue),
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      maxRedemptions: c.maxRedemptions ? String(c.maxRedemptions) : "",
    });
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;
    setBusyId(id);
    try {
      await updateCouponRequest(id, {
        description: editDraft.description.trim(),
        discountValue: Number(editDraft.discountValue),
        expiresAt: editDraft.expiresAt || null,
        maxRedemptions: editDraft.maxRedemptions ? Number(editDraft.maxRedemptions) : null,
      });
      await load();
      setEditId(null);
      setEditDraft(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setBusyId(coupon.id);
    try {
      await updateCouponRequest(coupon.id, { active: !coupon.active });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteCouponRequest(id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Coupons"
        subtitle="Discount codes and redemption limits"
        count={coupons?.length}
        onRefresh={refresh}
        refreshing={refreshing}
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" />
            New Coupon
          </Button>
        }
      />

      {showForm && (
        <Card variant="resting" padding="md">
          <h3 className="font-display text-base font-bold text-navy-900">Create coupon</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Code</span>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER25"
                className="input-field mt-1 uppercase"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Description</span>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Summer promotion"
                className="input-field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Discount type</span>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountType: e.target.value as DiscountType }))
                }
                className="input-field mt-1"
              >
                <option value="PERCENT">Percentage off</option>
                <option value="FIXED">Fixed amount off (£)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">
                Discount value {form.discountType === "PERCENT" ? "(%)" : "(£)"}
              </span>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                placeholder={form.discountType === "PERCENT" ? "25" : "50"}
                className="input-field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Expires (optional)</span>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="input-field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Max redemptions (optional)</span>
              <input
                type="number"
                min="1"
                value={form.maxRedemptions}
                onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
                placeholder="Unlimited"
                className="input-field mt-1"
              />
            </label>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Create coupon
            </Button>
          </div>
        </Card>
      )}

      {!coupons ? (
        <SkeletonRows />
      ) : coupons.length === 0 ? (
        <EmptyState message="No coupons yet — create one above." variant="card" />
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => {
            const usedPct = c.maxRedemptions
              ? Math.min(100, (c.timesRedeemed / c.maxRedemptions) * 100)
              : 0;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-brand-600" />
                      <span className="font-mono text-sm font-bold text-navy-900">{c.code}</span>
                      <StatusBadge tone={c.active ? "success" : "neutral"} size="sm">
                        {c.active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </div>
                    {c.description && (
                      <p className="mt-1 text-xs text-slate-500">{c.description}</p>
                    )}
                    <p className="mt-1 text-xs font-semibold text-brand-700">
                      {c.discountType === "PERCENT"
                        ? `${c.discountValue}% off`
                        : `£${c.discountValue} off`}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Used {c.timesRedeemed}
                      {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""} times
                      {c.expiresAt
                        ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString("en-GB")}`
                        : ""}
                    </p>
                    {c.maxRedemptions ? (
                      <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (editId === c.id ? setEditId(null) : startEdit(c))}
                      className="ags-focus flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      aria-label="Edit coupon"
                    >
                      {editId === c.id ? <X className="size-4" /> : <Pencil className="size-4" />}
                    </button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === c.id}
                      onClick={() => handleToggleActive(c)}
                    >
                      {c.active ? "Deactivate" : "Activate"}
                    </Button>
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => handleDelete(c.id)}
                      className="ags-focus flex size-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {editId === c.id && editDraft && (
                  <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-navy-700">Description</span>
                      <input
                        value={editDraft.description}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, description: e.target.value } : d))
                        }
                        className="input-field mt-1 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-navy-700">
                        Discount value {c.discountType === "PERCENT" ? "(%)" : "(£)"}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={editDraft.discountValue}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, discountValue: e.target.value } : d))
                        }
                        className="input-field mt-1 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-navy-700">Expires</span>
                      <input
                        type="date"
                        value={editDraft.expiresAt}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, expiresAt: e.target.value } : d))
                        }
                        className="input-field mt-1 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-navy-700">Max redemptions</span>
                      <input
                        type="number"
                        min="1"
                        value={editDraft.maxRedemptions}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, maxRedemptions: e.target.value } : d))
                        }
                        placeholder="Unlimited"
                        className="input-field mt-1 text-sm"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <Button size="sm" disabled={busyId === c.id} onClick={() => saveEdit(c.id)}>
                        {busyId === c.id && <Loader2 className="size-3.5 animate-spin" />}
                        Save changes
                      </Button>
                    </div>
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
