"use client";

import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import FadeInImage from "@/components/ui/fade-in-image";
import { requirementOptions } from "@/lib/data/booking-options";
import { serviceCategories } from "@/lib/data/services";

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-semibold text-navy-900">{value}</span>
    </div>
  );
}

export default function StepReview() {
  const { form, submit, submitting, reservation } = useBooking();

  const category = serviceCategories.find((c) => c.id === form.categoryId);
  const requirement = requirementOptions.find((r) => r.id === form.requirement);
  const formattedDate = form.date
    ? new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const fullAddress = [
    form.address.houseNumber,
    form.address.street,
    form.address.city,
    form.address.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <StepShell
      title="Review Your Booking"
      description="Please check everything looks right before submitting your request."
      canContinue={!!reservation}
      onContinue={submit}
      continueLabel="Submit Booking Request"
      loading={submitting}
    >
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 px-5">
        <Row label="Service Category" value={category?.name ?? ""} />
        <Row label="Equipment" value={form.equipmentLabel ?? ""} />
        <Row label="Requirement" value={requirement?.label ?? ""} />
        <Row label="Description" value={form.description || "—"} />
        <Row label="Date" value={formattedDate} />
        <Row label="Time" value={form.timeSlot?.label ?? ""} />
        <Row label="Name" value={form.customer.fullName} />
        <Row label="Phone" value={form.customer.phone} />
        <Row label="Email" value={form.customer.email} />
        <Row label="Address" value={fullAddress} />
        {form.address.instructions && <Row label="Notes" value={form.address.instructions} />}
      </div>

      {form.photos.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-navy-800">Uploaded Photos</p>
          <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {form.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                <FadeInImage src={photo.previewUrl} alt={photo.name} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 rounded-xl bg-sky-50 px-4 py-3.5 text-sm leading-relaxed text-navy-700">
        Service details and any applicable charges will be confirmed by our
        team &mdash; no payment is required at this stage.
      </p>
    </StepShell>
  );
}
