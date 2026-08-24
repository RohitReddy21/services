"use client";

import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { contactMethods } from "@/lib/data/booking-options";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_PHONE_RE = /^(?:\+44\s?|0)(?:\d\s?){9,10}$/;

export default function StepDetails() {
  const { form, setField } = useBooking();
  const { customer } = form;

  const isValid =
    customer.fullName.trim().length > 1 &&
    EMAIL_RE.test(customer.email) &&
    UK_PHONE_RE.test(customer.phone.replace(/\s/g, ""));

  const update = (patch: Partial<typeof customer>) =>
    setField("customer", { ...customer, ...patch });

  return (
    <StepShell
      title="Your Details"
      description="Tell us how the engineer or our team should reach you."
      canContinue={isValid}
    >
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
          <p className="text-sm font-semibold text-navy-800">Preferred Contact Method</p>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {contactMethods.map((method) => {
              const isSelected = customer.preferredContact === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => update({ preferredContact: method.id })}
                  className={cn(
                    "rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-navy-700 hover:border-brand-200"
                  )}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-semibold text-navy-800">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
