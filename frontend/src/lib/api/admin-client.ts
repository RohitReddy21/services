import type { Review, SupportTicket } from "@/types/account";
import type { BookingStatus } from "@/types/service";
import type { Subscription } from "@/types/subscription";
import type { AdminStats, AdminUserSummary, Coupon, DiscountType } from "@/types/coupon";
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

export function fetchAdminStats() {
  return get<AdminStats>("/api/admin/stats");
}

export function fetchAdminBookings(params?: { status?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search?.trim()) qs.set("search", params.search.trim());
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return get<{ bookings: Record<string, unknown>[] }>(`/api/admin/bookings${suffix}`).then((res) => ({
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

export function fetchAdminUsers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return get<{ users: AdminUserSummary[] }>(`/api/admin/users${qs}`);
}

export function updateUserRoleRequest(id: string, role: AdminUserSummary["role"]) {
  return send<{ user: AdminUserSummary }>(`/api/admin/users/${id}/role`, "PATCH", { role });
}

export function fetchAdminSubscriptions(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return get<{ subscriptions: Subscription[] }>(`/api/admin/subscriptions${qs}`);
}

export function sendSubscriptionInvoiceRequest(id: string) {
  return send<{ status: "sent" | "logged" | "failed"; to: string; invoiceNumber: string }>(
    `/api/admin/subscriptions/${id}/send-invoice`,
    "POST"
  );
}

export function fetchAdminReviews() {
  return get<{ reviews: Review[] }>("/api/admin/reviews");
}

export function deleteReviewRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/reviews/${id}`, "DELETE");
}

export function fetchAdminCoupons() {
  return get<{ coupons: Coupon[] }>("/api/admin/coupons");
}

export function createCouponRequest(input: {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  expiresAt: string | null;
  maxRedemptions: number | null;
}) {
  return send<{ coupon: Coupon }>("/api/admin/coupons", "POST", input);
}

export function updateCouponRequest(
  id: string,
  patch: Partial<{
    active: boolean;
    description: string;
    discountValue: number;
    expiresAt: string | null;
    maxRedemptions: number | null;
  }>
) {
  return send<{ coupon: Coupon }>(`/api/admin/coupons/${id}`, "PATCH", patch);
}

export function deleteCouponRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/coupons/${id}`, "DELETE");
}
