import type { SupportTicket } from "@/types/account";
import type { BookingStatus } from "@/types/service";
import { API_BASE_URL } from "@/lib/api/api-base";
import { mapBookingDoc } from "@/lib/api/booking-mapper";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

function get<T>(path: string) {
  return fetch(`${API_BASE_URL}${path}`, { credentials: "include" }).then((res) => json<T>(res));
}

function send<T>(path: string, method: string, body?: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then((res) => json<T>(res));
}

export function fetchAdminBookings(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return get<{ bookings: Record<string, unknown>[] }>(`/api/admin/bookings${qs}`).then((res) => ({
    bookings: res.bookings.map(mapBookingDoc),
  }));
}

export function updateBookingStatusRequest(reference: string, status: BookingStatus) {
  return send<Record<string, unknown>>(`/api/admin/bookings/${reference}/status`, "PATCH", {
    status,
  }).then(mapBookingDoc);
}

export function updateTechnicianRequest(
  reference: string,
  technicianName: string | null,
  technicianPhone: string | null
) {
  return send<Record<string, unknown>>(`/api/admin/bookings/${reference}/technician`, "PATCH", {
    technicianName,
    technicianPhone,
  }).then(mapBookingDoc);
}

export function fetchAdminSupportTickets(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return get<{ tickets: SupportTicket[] }>(`/api/admin/support-tickets${qs}`);
}

export function resolveSupportTicketRequest(id: string) {
  return send<{ ticket: SupportTicket }>(`/api/admin/support-tickets/${id}/resolve`, "PATCH");
}
