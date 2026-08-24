"use client";

import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import { cn } from "@/lib/utils";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

export default function StepAddress() {
  const { form, setField } = useBooking();
  const { address } = form;

  const isPostcodeValid = UK_POSTCODE_RE.test(address.postcode.trim());
  const isValid =
    address.houseNumber.trim().length > 0 &&
    address.street.trim().length > 1 &&
    address.city.trim().length > 1 &&
    isPostcodeValid;

  const update = (patch: Partial<typeof address>) =>
    setField("address", { ...address, ...patch });

  return (
    <StepShell
      title="Service Address"
      description="Where should our engineer attend?"
      canContinue={isValid}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="House / Building">
          <input
            type="text"
            value={address.houseNumber}
            onChange={(e) => update({ houseNumber: e.target.value })}
            placeholder="Flat 4, 22"
            className="input-field"
          />
        </Field>
        <Field label="Postcode">
          <input
            type="text"
            value={address.postcode}
            onChange={(e) => update({ postcode: e.target.value.toUpperCase() })}
            placeholder="W1U 3BW"
            className="input-field"
          />
          {address.postcode.trim().length > 0 && !isPostcodeValid && (
            <p className="mt-1.5 text-xs text-red-600">
              Enter a valid UK postcode (e.g. W1U 3BW, SW1A 1AA, M1 4WT). AGS
              currently only services UK addresses.
            </p>
          )}
        </Field>
        <Field label="Street" className="sm:col-span-2">
          <input
            type="text"
            value={address.street}
            onChange={(e) => update({ street: e.target.value })}
            placeholder="Baker Street"
            className="input-field"
          />
        </Field>
        <Field label="City / Town">
          <input
            type="text"
            value={address.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="London"
            className="input-field"
          />
        </Field>
        <Field label="Additional Instructions" className="sm:col-span-2">
          <textarea
            rows={3}
            value={address.instructions}
            onChange={(e) => update({ instructions: e.target.value })}
            placeholder="E.g. gate code, parking instructions, which floor..."
            className="input-field"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <Checkbox
          checked={address.saveAddress}
          onChange={(checked) => update({ saveAddress: checked })}
          label="Save this address to my account"
        />
        <Checkbox
          checked={address.setDefault}
          onChange={(checked) => update({ setDefault: checked })}
          label="Set as my default address"
          disabled={!address.saveAddress}
        />
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

function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-center gap-2.5 text-sm text-navy-700", disabled && "opacity-40")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
      />
      {label}
    </label>
  );
}
