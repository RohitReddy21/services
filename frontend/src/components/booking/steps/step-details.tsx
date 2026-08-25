"use client";

import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { contactMethods } from "@/lib/data/booking-options";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_PHONE_RE = /^(?:\+44\s?|0)(?:\d\s?){9,10}$/;

export default function StepDetails({ embedded = false }: { embedded?: boolean }) {
  const { form, setField } = useBooking();
  const { customer } = form;

  const isValid =
    customer.fullName.trim().length > 1 &&
    EMAIL_RE.test(customer.email) &&
    UK_PHONE_RE.test(customer.phone.replace(/\s/g, ""));

  const update = (patch: Partial<typeof customer>) =>
    setField("customer", { ...customer, ...patch });

  const content = (
    <>
      {embedded && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-navy-900">Contact Details</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            These details are used to confirm the appointment.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" className="sm:col-span-2">
          <input
            type="text"
            value={customer.fullName}
            onChange={(e) => update({ fullName: e.target.value })}
            placeholder="Jane Smith"
            className="input-field"
          />
        </Field>

        <Field label="Email Address">
          <input
            type="email"
            value={customer.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="jane@example.com"
            className="input-field"
          />
        </Field>

        <Field label="Phone Number">
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="07123 456789"
            className="input-field"
          />
        </Field>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-navy-800">Preferred Contact Method</p>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {contactMethods.map((method) => {
              const isSelected = customer.preferredContact === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => update({ preferredContact: method.id })}
                  className={cn(
                    "ags-focus rounded-lg border px-4 py-2 text-xs font-semibold transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-100"
                      : "border-slate-200 text-navy-700 hover:border-brand-200 hover:bg-slate-25"
                  )}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <section>{content}</section>;
  }

  return (
    <StepShell
      title="Your Details"
      description="Tell us how the engineer or our team should reach you."
      canContinue={isValid}
    >
      {content}
    </StepShell>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs font-semibold text-navy-800">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
