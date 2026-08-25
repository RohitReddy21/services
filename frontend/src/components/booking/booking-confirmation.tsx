import Link from "next/link";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import Logo from "@/components/navigation/logo";
import { ButtonLink } from "@/components/ui/button";
import { requirementOptions } from "@/lib/data/booking-options";
import { serviceCategories } from "@/lib/data/services";
import type { BookingRecord } from "@/types/booking";

export default function BookingConfirmation({ record }: { record: BookingRecord }) {
  const { data } = record;
  const category = serviceCategories.find((c) => c.id === data.categoryId);
  const requirement = requirementOptions.find((r) => r.id === data.requirement);
  const formattedDate = data.date
    ? new Date(data.date + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const fullAddress = [
    data.address.houseNumber,
    data.address.street,
    data.address.city,
    data.address.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="rounded-lg border border-brand-100 bg-white p-6 shadow-2xl shadow-navy-900/10 sm:p-8">
        <div className="flex justify-center">
          <Logo showTagline={false} className="pointer-events-none" />
        </div>
        <div className="mx-auto mt-6 flex size-20 items-center justify-center rounded-full bg-accent-green-100 text-accent-green-600 ags-pulse-ring">
          <CheckCircle2 className="size-9" />
        </div>
        <h1 className="mt-5 font-display text-xl font-extrabold text-navy-900 sm:text-2xl">
          Booking Request Received
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          Our team will review your request and contact you to confirm the
          appointment.
        </p>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-25 p-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Booking ID
            </span>
            <span className="font-display text-sm font-bold text-navy-900">
              {record.bookingReference}
            </span>
          </div>
          <dl className="divide-y divide-slate-200">
            <DetailRow label="Service" value={category?.name} />
            <DetailRow label="Equipment" value={data.equipmentLabel ?? undefined} />
            <DetailRow label="Requirement" value={requirement?.label} />
            <DetailRow label="Requested Date" value={formattedDate} />
            <DetailRow label="Requested Time" value={data.timeSlot?.label} />
            <DetailRow label="Address" value={fullAddress} />
          </dl>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800">
            <CalendarCheck className="size-4 shrink-0" />
            Status: Request Received
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`/book/confirmation/${record.bookingReference}`} size="lg">
            View My Booking
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="lg">
            Back to Home
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          A confirmation email has been sent to {data.customer.email}.{" "}
          <Link href="/account/bookings" className="font-semibold text-brand-600 hover:text-brand-700">
            Manage your bookings
          </Link>
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right text-xs font-semibold text-navy-900">{value}</dd>
    </div>
  );
}
