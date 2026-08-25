"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createCouponRequest,
  deleteCouponRequest,
  fetchAdminCoupons,
  updateCouponRequest,
} from "@/lib/api/admin-client";
import type { Coupon, DiscountType } from "@/types/coupon";
import { cn } from "@/lib/utils";

const emptyForm = {
  code: "",
  description: "",
  discountType: "PERCENT" as DiscountType,
  discountValue: "",
  expiresAt: "",
  maxRedemptions: "",
};

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => fetchAdminCoupons().then((res) => setCoupons(res.coupons));

  useEffect(() => {
    load();
  }, []);

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
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          New Coupon
        </Button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-base font-bold text-navy-900">Create Coupon</h3>
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
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as DiscountType }))}
                className="input-field mt-1"
              >
                <option value="PERCENT">Percentage off</option>
                <option value="FIXED">Fixed amount off (€)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">
                Discount value {form.discountType === "PERCENT" ? "(%)" : "(€)"}
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
              Create Coupon
            </Button>
          </div>
        </div>
      )}

      {!coupons ? (
        <div className="mt-6 flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-brand-500" />
        </div>
      ) : coupons.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No coupons yet — create one above.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {coupons.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-brand-600" />
                    <span className="font-mono text-sm font-bold text-navy-900">{c.code}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        c.active ? "bg-accent-green-50 text-accent-green-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {c.description && <p className="mt-1 text-xs text-slate-500">{c.description}</p>}
                  <p className="mt-1 text-xs font-semibold text-brand-700">
                    {c.discountType === "PERCENT" ? `${c.discountValue}% off` : `€${c.discountValue} off`}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Used {c.timesRedeemed}
                    {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""} times
                    {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString("en-GB")}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
                    className="flex size-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    aria-label="Delete coupon"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
