import { Booking } from "../models/Booking";
import { SlotReservation } from "../models/SlotReservation";
import { env } from "../config/env";

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  available: boolean;
}

export interface SlotGroup {
  period: "Morning" | "Afternoon" | "Evening";
  slots: TimeSlot[];
}

const PERIODS: { period: SlotGroup["period"]; times: [string, string][] }[] = [
  { period: "Morning", times: [["08:00", "10:00"], ["10:00", "12:00"]] },
  { period: "Afternoon", times: [["12:00", "14:00"], ["14:00", "16:00"]] },
  { period: "Evening", times: [["16:00", "18:00"]] },
];

/**
 * Capacity is company-wide per date+slot (not split by category/equipment —
 * the schema doesn't segment technicians by specialty). Counts confirmed
 * bookings plus live checkout holds, so a slot fills up in real time instead
 * of two customers both grabbing the "last" spot.
 */
async function bookedCountsForDate(dateStr: string): Promise<Map<string, number>> {
  const [bookingCounts, reservationCounts] = await Promise.all([
    Booking.aggregate<{ _id: string; count: number }>([
      { $match: { date: dateStr, status: { $ne: "CANCELLED" }, deletedAt: null } },
      { $group: { _id: "$timeSlot.id", count: { $sum: 1 } } },
    ]),
    SlotReservation.aggregate<{ _id: string; count: number }>([
      { $match: { date: dateStr, expiresAt: { $gt: new Date() } } },
      { $group: { _id: "$slotId", count: { $sum: 1 } } },
    ]),
  ]);

  const counts = new Map<string, number>();
  for (const row of bookingCounts) counts.set(row._id, (counts.get(row._id) ?? 0) + row.count);
  for (const row of reservationCounts) counts.set(row._id, (counts.get(row._id) ?? 0) + row.count);
  return counts;
}

export async function getSlotsForDate(dateStr: string, _seed: string): Promise<SlotGroup[]> {
  const counts = await bookedCountsForDate(dateStr);

  return PERIODS.map(({ period, times }) => ({
    period,
    slots: times.map(([start, end]) => {
      const slotId = `${period.toLowerCase()}-${start.replace(":", "")}`;
      return {
        id: slotId,
        label: `${start} - ${end}`,
        start,
        end,
        available: (counts.get(slotId) ?? 0) < env.maxJobsPerSlot,
      };
    }),
  }));
}

export async function getDayAvailability(dateStr: string, seed: string): Promise<boolean> {
  const groups = await getSlotsForDate(dateStr, seed);
  return groups.some((g) => g.slots.some((s) => s.available));
}

export async function isSlotAvailable(dateStr: string, slotId: string, seed: string) {
  const groups = await getSlotsForDate(dateStr, seed);
  const slot = groups.flatMap((g) => g.slots).find((s) => s.id === slotId);
  return !!slot?.available;
}
