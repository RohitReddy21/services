"use client";

import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { statusMeta } from "@/lib/data/booking-status";
import type { BookingRecord } from "@/types/booking";

const TONE: Record<string, BadgeTone> = {
  BOOKING_RECEIVED: "warning",
  CONFIRMED: "brand",
  TECHNICIAN_ASSIGNED: "brand",
  TECHNICIAN_ARRIVING: "info",
  SERVICE_STARTED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function addressLine(address: BookingRecord["data"]["address"]) {
  return [address?.houseNumber, address?.street, address?.city, address?.postcode]
    .filter(Boolean)
    .join(", ");
}

export default function JobCard({ job }: { job: BookingRecord }) {
  const meta = statusMeta[job.status];

  return (
    <Link
      href={`/technician/jobs/${job.bookingReference}`}
      className="ags-focus flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors active:bg-slate-50 hover:border-brand-200"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={TONE[job.status] ?? "neutral"} size="sm">
            {meta?.label ?? job.status}
          </StatusBadge>
          <span className="font-mono text-[11px] font-semibold text-slate-400">
            {job.bookingReference}
          </span>
        </div>

        <p className="mt-1.5 text-base font-bold text-navy-900">{job.data.customer.fullName}</p>
        <p className="text-sm text-slate-600">{job.data.equipmentLabel}</p>

        <div className="mt-2 space-y-1 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-slate-400" />
            {job.data.date} · {job.data.timeSlot?.label}
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{addressLine(job.data.address)}</span>
          </p>
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-slate-300" />
    </Link>
  );
}
