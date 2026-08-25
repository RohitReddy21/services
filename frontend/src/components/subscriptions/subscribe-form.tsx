"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Refrigerator, Snowflake } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@/lib/data/services";
import { equipmentOptions } from "@/lib/data/booking-options";
import { createSubscriptionRequest } from "@/lib/api/subscription-client";
import type { SubscriptionPlan } from "@/types/subscription";
import type { ServiceCategoryId } from "@/types/service";
import { cn } from "@/lib/utils";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
const categoryIcon = { snowflake: Snowflake, fridge: Refrigerator } as const;

export default function SubscribeForm({ plan }: { plan: SubscriptionPlan }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categoryId, setCategoryId] = useState<ServiceCategoryId | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [equipmentLabel, setEquipmentLabel] = useState<string | null>(null);
  const [address, setAddress] = useState({ houseNumber: "", street: "", city: "", postcode: "" });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/subscriptions/${plan.id}`);
    }
  }, [authLoading, user, router, plan.id]);

  const isPostcodeValid = UK_POSTCODE_RE.test(address.postcode.trim());
  const isValid =
    !!categoryId &&
    !!equipmentId &&
    address.houseNumber.trim().length > 0 &&
    address.street.trim().length > 1 &&
    address.city.trim().length > 1 &&
    isPostcodeValid;

  const handleSubmit = async () => {
    if (!isValid || !categoryId || !equipmentId || !equipmentLabel) return;
    setError(null);
    setSubmitting(true);
    try {
      await createSubscriptionRequest({
        planId: plan.id,
        planName: plan.name,
        frequency: plan.frequency,
        categoryId,
        equipmentId,
        equipmentLabel,
        address,
        notes,
        price: plan.price ?? null,
        servicesPerCycle: plan.servicesPerCycle ?? null,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-green-100 text-accent-green-600">
          <Check className="size-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-navy-900">
          You&apos;re subscribed to {plan.name}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Our team will be in touch to confirm your first visit and plan
          details.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => router.push("/account/subscriptions")}>
            View My Plans
          </Button>
          <Button size="lg" variant="secondary" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-slate-200 p-5 sm:p-8">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-900">
            1. Select Equipment Category
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {serviceCategories.map((category) => {
              const Icon = categoryIcon[category.icon];
              const isSelected = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(category.id);
                    setEquipmentId(null);
                    setEquipmentLabel(null);
                  }}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 hover:border-brand-200"
                  )}
                >
                  <Icon className={cn("size-5", isSelected ? "text-brand-600" : "text-slate-400")} />
                  <p className="mt-2 text-sm font-semibold text-navy-900">{category.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {categoryId && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-navy-900">2. Select Equipment</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {equipmentOptions[categoryId].map((option) => {
                const isSelected = equipmentId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setEquipmentId(option.id);
                      setEquipmentLabel(option.label);
                    }}
                    className={cn(
                      "rounded-xl border-2 px-3.5 py-3 text-left text-sm font-semibold transition-colors",
                      isSelected
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-navy-700 hover:border-brand-200"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {equipmentId && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-navy-900">3. Service Address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-navy-800">House / Building</span>
                <input
                  type="text"
                  value={address.houseNumber}
                  onChange={(e) => setAddress((a) => ({ ...a, houseNumber: e.target.value }))}
                  placeholder="Flat 4, 22"
                  className="input-field mt-1.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-navy-800">Postcode</span>
                <input
                  type="text"
                  value={address.postcode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, postcode: e.target.value.toUpperCase() }))
                  }
                  placeholder="W1U 3BW"
                  className="input-field mt-1.5"
                />
                {address.postcode.trim().length > 0 && !isPostcodeValid && (
                  <p className="mt-1.5 text-xs text-red-600">Enter a valid UK postcode.</p>
                )}
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-navy-800">Street</span>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                  placeholder="Baker Street"
                  className="input-field mt-1.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-navy-800">City / Town</span>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  placeholder="London"
                  className="input-field mt-1.5"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-navy-800">
                Notes for our team (optional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything we should know about your equipment or site access..."
                className="input-field mt-1.5"
              />
            </label>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button
          size="lg"
          className="mt-6 w-full sm:w-auto"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Confirm Subscription
        </Button>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-sky-50 p-6">
        <h3 className="font-display text-base font-bold text-navy-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{plan.tagline}</p>
        {plan.price ? (
          <p className="mt-3 text-sm font-semibold text-brand-700">
            &euro;{plan.price.amount} / {plan.price.billingCycleMonths} months &middot;{" "}
            {plan.servicesPerCycle} services included
          </p>
        ) : (
          <p className="mt-3 text-sm font-semibold text-brand-700">
            {plan.visitsPerYear} visit{plan.visitsPerYear > 1 ? "s" : ""} / year
          </p>
        )}
        <ul className="mt-4 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
              <Check className="mt-0.5 size-3.5 shrink-0 text-accent-green-600" />
              {f}
            </li>
          ))}
        </ul>
        {plan.rolloverPolicy && (
          <p className="mt-4 rounded-lg bg-white px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            {plan.rolloverPolicy}
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">
          Not the right plan?{" "}
          <Link href="/subscriptions" className="font-semibold text-brand-600 hover:text-brand-700">
            View all plans
          </Link>
        </p>
      </aside>
    </div>
  );
}
