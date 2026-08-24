import type { BookingFormData, DayAvailability, SlotGroup } from "@/types/booking";
import { API_BASE_URL } from "@/lib/api/api-base";
import { mapBookingDoc } from "@/lib/api/booking-mapper";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

export function fetchMonthAvailability(month: string, category: string, equipment: string) {
  const params = new URLSearchParams({ month, category, equipment });
  return fetch(`${API_BASE_URL}/api/availability?${params}`).then((res) =>
    json<{ days: DayAvailability[] }>(res)
  );
}

export function fetchDaySlots(date: string, category: string, equipment: string) {
  const params = new URLSearchParams({ date, category, equipment });
  return fetch(`${API_BASE_URL}/api/availability/slots?${params}`).then((res) =>
    json<{ groups: SlotGroup[] }>(res)
  );
}

export function reserveSlot(
  date: string,
  slotId: string,
  category: string,
  equipment: string
) {
  return fetch(`${API_BASE_URL}/api/slots/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ date, slotId, category, equipment }),
  }).then((res) => json<{ reservationId: string; expiresAt: number }>(res));
}

export function submitBooking(reservationId: string, data: BookingFormData) {
  // Only photos that finished uploading successfully (remoteUrl set) are
  // sent — anything still uploading/failed by the time of submit is dropped
  // rather than persisting a dead blob: URL.
  const payload = {
    ...data,
    photos: data.photos
      .filter((p) => p.status === "done" && p.remoteUrl)
      .map((p) => ({ name: p.name, url: p.remoteUrl as string })),
  };

  return fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reservationId, data: payload }),
  })
    .then((res) => json<Record<string, unknown>>(res))
    .then(mapBookingDoc);
}

export function fetchBooking(reference: string) {
  return fetch(`${API_BASE_URL}/api/bookings?reference=${encodeURIComponent(reference)}`, {
    credentials: "include",
  })
    .then((res) => json<Record<string, unknown>>(res))
    .then(mapBookingDoc);
}
