import Link from "next/link";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import { statusMeta } from "@/lib/data/booking-status";
import { serviceCategories } from "@/lib/data/services";
import type { BookingRecord } from "@/types/booking";

export default function BookingCard({ record }: { record: BookingRecord }) {
  const { data } = record;
  const category = serviceCategories.find((c) => c.id === data.categoryId);
  const meta = statusMeta[record.status];
  const formattedDate = data.date
    ? new Date(data.date + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
  const fullAddress = [data.address.street, data.address.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/account/bookings/${record.bookingReference}`}
      className="ags-focus group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-navy-900/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {record.bookingReference}
          </p>
          <h3 className="mt-1 font-display text-base font-bold text-navy-900">
            {category?.name} &middot; {data.equipmentLabel}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {data.timeSlot?.label ?? "—"}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {fullAddress || "—"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end text-sm font-semibold text-brand-600">
        View Details
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
