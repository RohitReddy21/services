import type { Review, SupportCategory, SupportTicket } from "@/types/account";
import type { BookingRecord } from "@/types/booking";
import type { BookingStatus, ServiceCategoryId } from "@/types/service";
import type { Subscription, SubscriptionFrequency, SubscriptionStatus } from "@/types/subscription";
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

function withArchived(base: string, includeArchived?: boolean, extra?: Record<string, string>) {
  const qs = new URLSearchParams(extra);
  if (includeArchived) qs.set("includeArchived", "1");
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

// ---------------- Overview ----------------

export function fetchAdminStats() {
  return get<AdminStats>("/api/admin/stats");
}

// ---------------- Bookings ----------------

export interface AdminBookingInput {
  customerId?: string | null;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  requirement: BookingRecord["data"]["requirement"];
  description: string;
  date: string;
  timeSlot: { id?: string; label: string; start: string; end: string };
  status?: BookingStatus;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    preferredContact: "phone" | "email" | "sms";
  };
  address: {
    houseNumber: string;
    street: string;
    city: string;
    postcode: string;
    instructions: string;
  };
  technicianName?: string | null;
  technicianPhone?: string | null;
}

export function fetchAdminBookings(params?: {
  status?: string;
  search?: string;
  includeArchived?: boolean;
}) {
  const extra: Record<string, string> = {};
  if (params?.status) extra.status = params.status;
  if (params?.search?.trim()) extra.search = params.search.trim();
  return get<{ bookings: Record<string, unknown>[] }>(
    withArchived("/api/admin/bookings", params?.includeArchived, extra)
  ).then((res) => ({ bookings: res.bookings.map(mapBookingDoc) }));
}

export function createBookingRequest(input: AdminBookingInput) {
  return send<Record<string, unknown>>("/api/admin/bookings", "POST", input).then(mapBookingDoc);
}

export function updateBookingRequest(reference: string, patch: Partial<AdminBookingInput>) {
  return send<Record<string, unknown>>(
    `/api/admin/bookings/${reference}`,
    "PATCH",
    patch
  ).then(mapBookingDoc);
}

export function updateBookingStatusRequest(reference: string, status: BookingStatus) {
  return send<Record<string, unknown>>(`/api/admin/bookings/${reference}/status`, "PATCH", {
    status,
  }).then(mapBookingDoc);
}

export interface AdminTechnician {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/** Engineer accounts available to assign to a job. */
export function fetchAdminTechnicians() {
  return get<{ technicians: AdminTechnician[] }>("/api/admin/technicians");
}

/** Assign a real engineer account — also moves the job to TECHNICIAN_ASSIGNED. */
export function assignTechnicianRequest(reference: string, technicianId: string | null) {
  return send<Record<string, unknown>>(`/api/admin/bookings/${reference}/technician`, "PATCH", {
    technicianId,
  }).then(mapBookingDoc);
}

/** Fallback for assigning someone who doesn't have an account yet. */
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

export function archiveBookingRequest(reference: string) {
  return send<{ ok: boolean }>(`/api/admin/bookings/${reference}`, "DELETE");
}

export function restoreBookingRequest(reference: string) {
  return send<{ ok: boolean }>(`/api/admin/bookings/${reference}/restore`, "POST");
}

// ---------------- Support tickets ----------------

export interface AdminTicketInput {
  category: SupportCategory;
  subject: string;
  message: string;
  email: string;
  status?: "OPEN" | "RESOLVED";
  userId?: string | null;
}

export function fetchAdminSupportTickets(params?: { status?: string; includeArchived?: boolean }) {
  const extra: Record<string, string> = {};
  if (params?.status) extra.status = params.status;
  return get<{ tickets: SupportTicket[] }>(
    withArchived("/api/admin/support-tickets", params?.includeArchived, extra)
  );
}

export function createSupportTicketRequest(input: AdminTicketInput) {
  return send<{ ticket: SupportTicket }>("/api/admin/support-tickets", "POST", input);
}

export function updateSupportTicketRequest(id: string, patch: Partial<AdminTicketInput>) {
  return send<{ ticket: SupportTicket }>(`/api/admin/support-tickets/${id}`, "PATCH", patch);
}

export function resolveSupportTicketRequest(id: string) {
  return send<{ ticket: SupportTicket }>(`/api/admin/support-tickets/${id}/resolve`, "PATCH");
}

export function reopenSupportTicketRequest(id: string) {
  return send<{ ticket: SupportTicket }>(`/api/admin/support-tickets/${id}/reopen`, "POST");
}

export function archiveSupportTicketRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/support-tickets/${id}`, "DELETE");
}

export function restoreSupportTicketRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/support-tickets/${id}/restore`, "POST");
}

// ---------------- Users ----------------

export interface AdminUserInput {
  name: string;
  email: string;
  phone: string;
  role: AdminUserSummary["role"];
  password: string;
}

export function fetchAdminUsers(params?: { search?: string; includeArchived?: boolean }) {
  const extra: Record<string, string> = {};
  if (params?.search?.trim()) extra.search = params.search.trim();
  return get<{ users: AdminUserSummary[] }>(
    withArchived("/api/admin/users", params?.includeArchived, extra)
  );
}

export function createUserRequest(input: AdminUserInput) {
  return send<{ user: AdminUserSummary }>("/api/admin/users", "POST", input);
}

export function updateUserRequest(
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    phone: string;
    role: AdminUserSummary["role"];
    loyaltyPoints: number;
    emailVerified: boolean;
  }>
) {
  return send<{ user: AdminUserSummary }>(`/api/admin/users/${id}`, "PATCH", patch);
}

export function updateUserRoleRequest(id: string, role: AdminUserSummary["role"]) {
  return send<{ user: AdminUserSummary }>(`/api/admin/users/${id}/role`, "PATCH", { role });
}

export function setUserPasswordRequest(id: string, password: string) {
  return send<{ ok: boolean; user: AdminUserSummary }>(`/api/admin/users/${id}/password`, "PATCH", {
    password,
  });
}

export function archiveUserRequest(id: string) {
  return send<{ ok: boolean; user: AdminUserSummary }>(`/api/admin/users/${id}`, "DELETE");
}

export function restoreUserRequest(id: string) {
  return send<{ ok: boolean; user: AdminUserSummary }>(`/api/admin/users/${id}/restore`, "POST");
}

// ---------------- Subscriptions ----------------

export interface AdminSubscriptionInput {
  userId: string;
  planId: string;
  planName: string;
  frequency: SubscriptionFrequency;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  status?: SubscriptionStatus;
  address: { houseNumber: string; street: string; city: string; postcode: string };
  notes: string;
  price: { amount: number; currency: "GBP"; billingCycleMonths: number } | null;
  servicesPerCycle?: number | null;
  startDate?: string;
  nextVisitDate?: string;
}

export function fetchAdminSubscriptions(params?: {
  status?: string;
  includeArchived?: boolean;
}) {
  const extra: Record<string, string> = {};
  if (params?.status) extra.status = params.status;
  return get<{ subscriptions: Subscription[] }>(
    withArchived("/api/admin/subscriptions", params?.includeArchived, extra)
  );
}

export function createSubscriptionRequest(input: AdminSubscriptionInput) {
  return send<{ subscription: Subscription }>("/api/admin/subscriptions", "POST", input);
}

export function updateSubscriptionRequest(
  id: string,
  patch: Partial<Omit<AdminSubscriptionInput, "userId">>
) {
  return send<{ subscription: Subscription }>(`/api/admin/subscriptions/${id}`, "PATCH", patch);
}

export function archiveSubscriptionRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/subscriptions/${id}`, "DELETE");
}

export function restoreSubscriptionRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/subscriptions/${id}/restore`, "POST");
}

export function sendSubscriptionInvoiceRequest(id: string) {
  return send<{ status: "sent" | "logged" | "failed"; to: string; invoiceNumber: string }>(
    `/api/admin/subscriptions/${id}/send-invoice`,
    "POST"
  );
}

// ---------------- Reviews ----------------

export interface AdminReviewInput {
  userId: string;
  bookingReference: string;
  serviceName: string;
  rating: number;
  text: string;
}

export function fetchAdminReviews(params?: { includeArchived?: boolean }) {
  return get<{ reviews: Review[] }>(
    withArchived("/api/admin/reviews", params?.includeArchived)
  );
}

export function createReviewRequest(input: AdminReviewInput) {
  return send<{ review: Review }>("/api/admin/reviews", "POST", input);
}

export function updateReviewRequest(
  id: string,
  patch: Partial<{ serviceName: string; rating: number; text: string }>
) {
  return send<{ review: Review }>(`/api/admin/reviews/${id}`, "PATCH", patch);
}

export function deleteReviewRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/reviews/${id}`, "DELETE");
}

export function restoreReviewRequest(id: string) {
  return send<{ ok: boolean }>(`/api/admin/reviews/${id}/restore`, "POST");
}

// ---------------- Coupons ----------------

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
