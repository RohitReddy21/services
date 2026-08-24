"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createAddressRequest,
  deleteAddressRequest,
  fetchAddresses,
  updateAddressRequest,
} from "@/lib/api/account-client";
import type { Address, AddressLabel } from "@/types/account";
import { cn } from "@/lib/utils";

const LABELS: AddressLabel[] = ["Home", "Business", "Other"];

const emptyForm = {
  label: "Home" as AddressLabel,
  houseNumber: "",
  street: "",
  city: "",
  postcode: "",
  instructions: "",
  isDefault: false,
};

export default function AddressesManager() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => fetchAddresses().then((res) => setAddresses(res.addresses));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setForm({
      label: address.label,
      houseNumber: address.houseNumber,
      street: address.street,
      city: address.city,
      postcode: address.postcode,
      instructions: address.instructions,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.houseNumber || !form.street || !form.city || !form.postcode) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateAddressRequest(editing.id, form);
      } else {
        await createAddressRequest(form);
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
    await deleteAddressRequest(id);
    await load();
  };

  const handleSetDefault = async (id: string) => {
    await updateAddressRequest(id, { isDefault: true });
    await load();
  };

  if (!addresses) {
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
          Add Address
        </Button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <MapPin className="mx-auto size-6 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No saved addresses yet.</p>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                {address.label}
              </span>
              {address.isDefault && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-gold-600">
                  <Star className="size-3 fill-accent-gold-500 text-accent-gold-500" />
                  Default
                </span>
              )}
            </div>
            <p className="mt-2.5 text-sm text-navy-800">
              {address.houseNumber} {address.street}, {address.city}, {address.postcode}
            </p>
            {address.instructions && (
              <p className="mt-1 text-xs text-slate-400">{address.instructions}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => openEdit(address)}
                className="flex items-center gap-1 text-brand-600 hover:text-brand-700"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(address.id)}
                  className="text-slate-500 hover:text-navy-800"
                >
                  Set Default
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                className="ml-auto flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-base font-bold text-navy-900">
            {editing ? "Edit Address" : "Add Address"}
          </h3>

          <div className="mt-4 flex gap-2">
            {LABELS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setForm((f) => ({ ...f, label }))}
                className={cn(
                  "rounded-lg border-2 px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  form.label === label
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={form.houseNumber}
              onChange={(e) => setForm((f) => ({ ...f, houseNumber: e.target.value }))}
              placeholder="House / Building"
              className="input-field"
            />
            <input
              value={form.postcode}
              onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value.toUpperCase() }))}
              placeholder="Postcode"
              className="input-field"
            />
            <input
              value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              placeholder="Street"
              className="input-field sm:col-span-2"
            />
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="City / Town"
              className="input-field"
            />
            <textarea
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
              placeholder="Additional instructions"
              rows={2}
              className="input-field sm:col-span-2"
            />
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            Set as default address
          </label>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Save Address
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
