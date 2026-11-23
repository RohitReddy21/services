"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Refrigerator, ShieldCheck, Snowflake, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createEquipmentRequest,
  deleteEquipmentRequest,
  fetchMyEquipment,
  updateEquipmentRequest,
} from "@/lib/api/equipment-client";
import { serviceCategories } from "@/lib/data/services";
import { equipmentOptions } from "@/lib/data/booking-options";
import type { Equipment } from "@/types/equipment";
import type { ServiceCategoryId } from "@/types/service";
import { cn } from "@/lib/utils";

const categoryIcon = { snowflake: Snowflake, fridge: Refrigerator } as const;

const emptyForm = {
  categoryId: "air-conditioning" as ServiceCategoryId,
  equipmentId: "",
  equipmentLabel: "",
  nickname: "",
  brand: "",
  serialNumber: "",
  installDate: "",
  warrantyExpiry: "",
  notes: "",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function EquipmentManager() {
  const [equipment, setEquipment] = useState<Equipment[] | null>(null);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => fetchMyEquipment().then((res) => setEquipment(res.equipment));

  useEffect(() => {
    load();
  }, []);

  const options = equipmentOptions[form.categoryId];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: Equipment) => {
    setEditing(item);
    setForm({
      categoryId: item.categoryId,
      equipmentId: item.equipmentId,
      equipmentLabel: item.equipmentLabel,
      nickname: item.nickname,
      brand: item.brand,
      serialNumber: item.serialNumber,
      installDate: item.installDate ? item.installDate.slice(0, 10) : "",
      warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.slice(0, 10) : "",
      notes: item.notes,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.equipmentId) {
      setError("Please select an equipment type.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        installDate: form.installDate || null,
        warrantyExpiry: form.warrantyExpiry || null,
      };
      if (editing) {
        await updateEquipmentRequest(editing.id, payload);
      } else {
        await createEquipmentRequest(payload);
      }
      await load();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEquipmentRequest(id);
    await load();
  };

  if (!equipment) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          Add Equipment
        </Button>
      </div>

      {equipment.length === 0 && !showForm && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <ShieldCheck className="mx-auto size-6 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No equipment saved yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Save your AC units and refrigeration equipment here to reuse their details on future bookings.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {equipment.map((item) => {
          const category = serviceCategories.find((c) => c.id === item.categoryId);
          const Icon = category ? categoryIcon[category.icon] : Snowflake;
          const install = formatDate(item.installDate);
          const warranty = formatDate(item.warrantyExpiry);
          return (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  <Icon className="size-3" />
                  {item.equipmentLabel}
                </span>
              </div>
              <p className="mt-2.5 text-sm font-semibold text-navy-800">
                {item.nickname || item.equipmentLabel}
              </p>
              <dl className="mt-1.5 space-y-0.5 text-xs text-slate-500">
                {item.brand && <p>Brand: {item.brand}</p>}
                {item.serialNumber && <p>Serial: {item.serialNumber}</p>}
                {install && <p>Installed: {install}</p>}
                {warranty && <p>Warranty until: {warranty}</p>}
              </dl>
              {item.notes && <p className="mt-1.5 text-xs text-slate-400">{item.notes}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-700"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="ml-auto flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-base font-bold text-navy-900">
            {editing ? "Edit Equipment" : "Add Equipment"}
          </h3>

          <div className="mt-4 flex gap-2">
            {serviceCategories.map((category) => {
              const Icon = categoryIcon[category.icon];
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, categoryId: category.id, equipmentId: "", equipmentLabel: "" }))
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border-2 px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    form.categoryId === category.id
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-500"
                  )}
                >
                  <Icon className="size-3.5" />
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, equipmentId: option.id, equipmentLabel: option.label }))
                }
                className={cn(
                  "rounded-lg border-2 px-3 py-2 text-left text-xs font-semibold transition-colors",
                  form.equipmentId === option.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-navy-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={form.nickname}
              onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
              placeholder="Nickname (e.g. Kitchen fridge)"
              className="input-field sm:col-span-2"
            />
            <input
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              placeholder="Brand / Model"
              className="input-field"
            />
            <input
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
              placeholder="Serial number"
              className="input-field"
            />
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Install date</span>
              <input
                type="date"
                value={form.installDate}
                onChange={(e) => setForm((f) => ({ ...f, installDate: e.target.value }))}
                className="input-field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-navy-700">Warranty expiry</span>
              <input
                type="date"
                value={form.warrantyExpiry}
                onChange={(e) => setForm((f) => ({ ...f, warrantyExpiry: e.target.value }))}
                className="input-field mt-1"
              />
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (access instructions, quirks, etc.)"
              rows={2}
              className="input-field sm:col-span-2"
            />
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Save Equipment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
