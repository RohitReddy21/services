import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, Navigation, Phone, Star, UserRound, Wrench } from "lucide-react";
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
          {record.status === "TECHNICIAN_ARRIVING" && (
            <section className="flex items-center gap-3 rounded-2xl border border-brand-300 bg-brand-50 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Navigation className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy-900">
                  {record.technicianName ?? "Your engineer"} is on the way
                </p>
                <p className="text-xs text-slate-600">
                  Arriving within your {data.timeSlot?.label ?? "booked"} slot.
                </p>
              </div>
            </section>
          )}

          {record.status === "SERVICE_STARTED" && (
            <section className="flex items-center gap-3 rounded-2xl border border-brand-300 bg-brand-50 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Wrench className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy-900">Work in progress</p>
                <p className="text-xs text-slate-600">
                  {record.technicianName ?? "Your engineer"} is on site now.
                </p>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm shadow-brand-100">
            <h2 className="font-display text-base font-bold text-navy-900">Status</h2>
            <div className="mt-4">
              <BookingTimeline status={record.status} history={record.statusHistory} />
            </div>
          </section>

          {record.status === "COMPLETED" &&
            (record.completionNotes || (record.completionPhotos?.length ?? 0) > 0) && (
              <section className="rounded-2xl border border-accent-green-200 bg-accent-green-50 p-5">
                <h2 className="font-display text-base font-bold text-navy-900">
                  What the engineer did
                </h2>
                {record.completionNotes && (
                  <p className="mt-2 text-sm text-navy-800">{record.completionNotes}</p>
                )}
                {(record.completionPhotos?.length ?? 0) > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {record.completionPhotos!.map((photo) => (
                      <div
                        key={photo.url}
                        className="relative aspect-square overflow-hidden rounded-lg border border-accent-green-200 bg-white"
                      >
                        <FadeInImage
                          src={photo.url}
                          alt={photo.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

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
            <h2 className="font-display text-sm font-bold text-navy-900">Your engineer</h2>
            {record.technicianName ? (
              <div className="mt-3 rounded-xl bg-slate-25 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-700">
                    {record.technicianName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy-900">{record.technicianName}</p>
                    {record.engineer?.avgRating ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={
                                i < Math.round(record.engineer!.avgRating!)
                                  ? "size-3 fill-accent-gold-500 text-accent-gold-500"
                                  : "size-3 text-slate-300"
                              }
                            />
                          ))}
                        </span>
                        <span className="font-semibold text-navy-800">
                          {record.engineer.avgRating.toFixed(1)}
                        </span>
                        <span className="text-slate-400">({record.engineer.reviewCount})</span>
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-400">No ratings yet</p>
                    )}
                    {record.engineer?.jobsCompleted ? (
                      <p className="text-xs text-slate-500">
                        {record.engineer.jobsCompleted} jobs completed with AGS
                      </p>
                    ) : null}
                  </div>
                </div>
                {record.technicianPhone && (
                  <a
                    href={`tel:${record.technicianPhone}`}
                    className="ags-focus mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-white py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    <Phone className="size-3.5" />
                    Call {record.technicianName.split(" ")[0]}
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-25 p-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <UserRound className="size-4" />
                </span>
                <p className="text-xs text-slate-500">Not yet assigned</p>
              </div>
            )}
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
