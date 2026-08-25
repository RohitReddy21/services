import type { PublicUser } from "@/types/auth";
import type { Address, Notification, Review, SupportCategory } from "@/types/account";
import type { TimeSlot } from "@/types/booking";
import { API_BASE_URL } from "@/lib/api/api-base";
import { mapBookingDoc } from "@/lib/api/booking-mapper";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

const jsonHeaders = { "Content-Type": "application/json" };

function get<T>(path: string) {
  return fetch(`${API_BASE_URL}${path}`, { credentials: "include" }).then((res) => json<T>(res));
}

function send<T>(path: string, method: string, body?: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: jsonHeaders,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then((res) => json<T>(res));
}

// ---------------- Bookings ----------------

export function fetchMyBookings() {
  return get<{ bookings: Record<string, unknown>[] }>("/api/bookings?mine=true").then((res) => ({
    bookings: res.bookings.map(mapBookingDoc),
  }));
}

export function cancelBookingRequest(reference: string) {
  return send<Record<string, unknown>>(`/api/bookings/${reference}/cancel`, "POST").then(
    mapBookingDoc
  );
}

export function rescheduleBookingRequest(reference: string, date: string, timeSlot: TimeSlot) {
  return send<Record<string, unknown>>(`/api/bookings/${reference}/reschedule`, "POST", {
    date,
    timeSlot,
  }).then(mapBookingDoc);
}

// ---------------- Profile ----------------

export function updateProfileRequest(patch: {
  name?: string;
  phone?: string;
  profileImage?: string | null;
  notificationPreferences?: { email: boolean; sms: boolean };
}) {
  return send<{ user: PublicUser }>("/api/account/profile", "PATCH", patch);
}

export function changePasswordRequest(currentPassword: string, newPassword: string) {
  return send<{ ok: boolean }>("/api/auth/change-password", "POST", {
    currentPassword,
    newPassword,
  });
}

// ---------------- Addresses ----------------

export function fetchAddresses() {
  return get<{ addresses: Address[] }>("/api/account/addresses");
}

export function createAddressRequest(input: Omit<Address, "id" | "userId">) {
  return send<{ address: Address }>("/api/account/addresses", "POST", input);
}

export function updateAddressRequest(id: string, patch: Partial<Omit<Address, "id" | "userId">>) {
  return send<{ address: Address }>(`/api/account/addresses/${id}`, "PATCH", patch);
}

export function deleteAddressRequest(id: string) {
  return send<{ ok: boolean }>(`/api/account/addresses/${id}`, "DELETE");
}

// ---------------- Notifications ----------------

export function fetchNotifications() {
  return get<{ notifications: Notification[] }>("/api/account/notifications");
}

export function markNotificationReadRequest(id: string) {
  return send<{ notification: Notification }>(`/api/account/notifications/${id}/read`, "PATCH");
}

// ---------------- Reviews ----------------

export function fetchMyReviews() {
  return get<{ reviews: Review[] }>("/api/reviews");
}

export function submitReviewRequest(input: { bookingReference: string; rating: number; text: string }) {
  return send<{ review: Review }>("/api/reviews", "POST", input);
}

// ---------------- Support ----------------

export function submitSupportTicketRequest(input: {
  category: SupportCategory;
  subject: string;
  message: string;
  email: string;
}) {
  return send("/api/support", "POST", input);
}
