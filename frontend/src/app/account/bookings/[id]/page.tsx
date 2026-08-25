import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/server/current-user";
import { serverFetch } from "@/lib/server/backend-fetch";
import { mapBookingDoc } from "@/lib/api/booking-mapper";
import { requirementOptions } from "@/lib/data/booking-options";
import { serviceCategories } from "@/lib/data/services";
import BookingTimeline from "@/components/account/booking-timeline";
import BookingActions from "@/components/account/booking-actions";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import { API_BASE_URL } from "@/lib/api/api-base";

export const metadata: Metadata = {
  title: "Booking Details",
};

export default async function BookingDetailPage({
  params,
}: PageProps<"/account/bookings/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const res = await serverFetch(`/api/bookings?reference=${encodeURIComponent(id)}`);
  if (!res.ok) notFound();
  const doc = (await res.json()) as Record<string, unknown>;
  const record = mapBookingDoc(doc);
  if (record.customerId !== user.id) notFound();

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
    : "—";
  const fullAddress = [
    data.address.houseNumber,
    data.address.street,
    data.address.city,
    data.address.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <Link
        href="/account/bookings"
        className="ags-focus inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-slate-500 hover:text-navy-800"
      >
        <ChevronLeft className="size-4" />
        Back to My Bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {record.bookingReference}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
            {category?.name} &middot; {data.equipmentLabel}
          </h1>
        </div>
        <ButtonLink href="/account/support" variant="secondary" size="sm">
          Contact Support
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm shadow-brand-100">
            <h2 className="font-display text-base font-bold text-navy-900">Status</h2>
            <div className="mt-4">
              <BookingTimeline status={record.status} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5">
            <h2 className="font-display text-base font-bold text-navy-900">Details</h2>
            <dl className="mt-3 divide-y divide-slate-100">
              <Row label="Requirement" value={requirement?.label} />
              <Row label="Description" value={data.description || "—"} />
              <Row label="Date" value={formattedDate} />
              <Row label="Time" value={data.timeSlot?.label} />
              <Row label="Address" value={fullAddress} />
              {data.address.instructions && <Row label="Notes" value={data.address.instructions} />}
            </dl>
          </section>

          {data.photos.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5">
              <h2 className="font-display text-base font-bold text-navy-900">Photos</h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {data.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <FadeInImage src={photo.previewUrl} alt={photo.name} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5">
            <h2 className="font-display text-base font-bold text-navy-900">Manage Booking</h2>
            <div className="mt-3">
              <BookingActions
                bookingReference={record.bookingReference}
                status={record.status}
                categoryId={data.categoryId ?? ""}
                equipmentId={data.equipmentId ?? ""}
              />
              {(record.status === "CANCELLED" || record.status === "COMPLETED") && (
                <p className="text-sm text-slate-400">
                  This booking is {record.status === "CANCELLED" ? "cancelled" : "completed"} and can no
                  longer be changed.
                </p>
              )}
              {record.status === "COMPLETED" && (
                <a
                  href={`${API_BASE_URL}/api/bookings/${record.bookingReference}/certificate`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ags-focus mt-3 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Download className="size-4" />
                  Download Service Certificate
                </a>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5">
            <h2 className="font-display text-sm font-bold text-navy-900">Technician</h2>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-25 p-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <UserRound className="size-4" />
              </span>
              {record.technicianName ? (
                <div>
                  <p className="text-xs font-semibold text-navy-800">{record.technicianName}</p>
                  {record.technicianPhone && (
                    <p className="text-xs text-slate-500">{record.technicianPhone}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Not yet assigned</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5">
            <h2 className="font-display text-sm font-bold text-navy-900">Contact Details</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-semibold text-navy-800">{data.customer.fullName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-semibold text-navy-800">{data.customer.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-semibold text-navy-800">{data.customer.email}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right text-sm font-semibold text-navy-900">{value}</dd>
    </div>
  );
}
