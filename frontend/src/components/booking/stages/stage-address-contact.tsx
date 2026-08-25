"use client";

import StepAddress from "@/components/booking/steps/step-address";
import StepDetails from "@/components/booking/steps/step-details";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_PHONE_RE = /^(?:\+44\s?|0)(?:\d\s?){9,10}$/;
const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

export default function StageAddressContact() {
  const { form } = useBooking();
  const customerValid =
    form.customer.fullName.trim().length > 1 &&
    EMAIL_RE.test(form.customer.email) &&
    UK_PHONE_RE.test(form.customer.phone.replace(/\s/g, ""));
  const addressValid =
    form.address.houseNumber.trim().length > 0 &&
    form.address.street.trim().length > 1 &&
    form.address.city.trim().length > 1 &&
    UK_POSTCODE_RE.test(form.address.postcode.trim());

  return (
    <StepShell
      title="Address & Contact"
      description="Where should our engineer visit, and how should we reach you?"
      canContinue={customerValid && addressValid}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <StepAddress embedded />
        <StepDetails embedded />
      </div>
    </StepShell>
  );
}
