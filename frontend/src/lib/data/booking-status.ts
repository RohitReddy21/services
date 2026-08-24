import type { BookingStatus } from "@/types/service";

export const statusMeta: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  BOOKING_RECEIVED: { label: "Request Received", color: "text-amber-700", bg: "bg-amber-50" },
  CONFIRMED: { label: "Confirmed", color: "text-brand-700", bg: "bg-brand-50" },
  TECHNICIAN_ASSIGNED: { label: "Technician Assigned", color: "text-brand-700", bg: "bg-brand-50" },
  TECHNICIAN_ARRIVING: { label: "Technician Arriving", color: "text-brand-700", bg: "bg-brand-50" },
  SERVICE_STARTED: { label: "Service In Progress", color: "text-purple-700", bg: "bg-purple-50" },
  COMPLETED: { label: "Completed", color: "text-accent-green-700", bg: "bg-accent-green-50" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50" },
};

/** Ordered "happy path" — CANCELLED is a terminal state reached from any step. */
export const statusTimeline: BookingStatus[] = [
  "BOOKING_RECEIVED",
  "CONFIRMED",
  "TECHNICIAN_ASSIGNED",
  "TECHNICIAN_ARRIVING",
  "SERVICE_STARTED",
  "COMPLETED",
];

export function isUpcoming(status: BookingStatus) {
  return !["COMPLETED", "CANCELLED"].includes(status) && status !== "SERVICE_STARTED";
}

export function isActive(status: BookingStatus) {
  return ["TECHNICIAN_ASSIGNED", "TECHNICIAN_ARRIVING", "SERVICE_STARTED"].includes(status);
}
