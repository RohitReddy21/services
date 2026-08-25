"use client";

import { AlertCircle } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import FadeInImage from "@/components/ui/fade-in-image";
import { requirementOptions } from "@/lib/data/booking-options";
import { serviceCategories } from "@/lib/data/services";
import type { ReactNode } from "react";

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right text-xs font-semibold text-navy-900">
        {value}
      </dd>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </h3>
      <dl className="mt-2 divide-y divide-slate-100">{children}</dl>
    </section>
  );
}

export default function StepReview() {
  const { form, submit, submitting, reservation, goToStep } = useBooking();

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
      <div className="grid gap-3">
        <ReviewSection title="Service cart">
          <Row label="Service Category" value={category?.name ?? ""} />
          <Row label="Equipment" value={form.equipmentLabel ?? ""} />
          <Row label="Requirement" value={requirement?.label ?? ""} />
          <Row label="Description" value={form.description || "-"} />
          <Row label="Date" value={formattedDate} />
          <Row label="Time" value={form.timeSlot?.label ?? ""} />
        </ReviewSection>

        <ReviewSection title="Checkout details">
          <Row label="Name" value={form.customer.fullName} />
          <Row label="Phone" value={form.customer.phone} />
          <Row label="Email" value={form.customer.email} />
          <Row label="Address" value={fullAddress} />
          {form.address.instructions && (
            <Row label="Notes" value={form.address.instructions} />
          )}
        </ReviewSection>
      </div>

      {form.photos.length > 0 && (
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Uploaded photos
          </h3>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {form.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                <FadeInImage
                  src={photo.previewUrl}
                  alt={photo.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {!reservation && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Your held slot needs refreshing.</p>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="mt-1 font-bold text-brand-700 underline"
            >
              Choose a time slot again
            </button>
          </div>
        </div>
      )}

      <p className="mt-5 rounded-lg border border-brand-100 bg-sky-50 px-4 py-3.5 text-xs leading-relaxed text-navy-700">
        Service details and any applicable charges will be confirmed by our
        team. No payment is required at this stage.
      </p>
    </StepShell>
  );
}
