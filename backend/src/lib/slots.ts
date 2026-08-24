import { Booking } from "../models/Booking";
import { SlotReservation } from "../models/SlotReservation";

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

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDayAvailability(dateStr: string, seed: string) {
  const date = new Date(dateStr + "T00:00:00");
  if (date.getDay() === 0) return false; // closed Sundays

  const seedValue = hashString(`${dateStr}::${seed}`);
  return seedValue % 100 < 85; // ~85% of open days have some availability
}

/** Slot IDs already reserved (unexpired) or booked for this date, from MongoDB. */
async function getTakenSlotIds(date: string) {
  const [reservations, bookings] = await Promise.all([
    SlotReservation.find({ date, expiresAt: { $gt: new Date() } }).select("slotId").lean(),
    Booking.find({ date, status: { $ne: "CANCELLED" } }).select("timeSlot.id").lean(),
  ]);

  const taken = new Set<string>();
  for (const r of reservations) taken.add(r.slotId);
  for (const b of bookings) if (b.timeSlot?.id) taken.add(b.timeSlot.id);
  return taken;
}

export async function getSlotsForDate(dateStr: string, seed: string): Promise<SlotGroup[]> {
  const dayHasAvailability = getDayAvailability(dateStr, seed);
  const takenSlotIds = await getTakenSlotIds(dateStr);

  return PERIODS.map(({ period, times }) => ({
    period,
    slots: times.map(([start, end]) => {
      const slotId = `${period.toLowerCase()}-${start.replace(":", "")}`;
      const seedValue = hashString(`${dateStr}::${seed}::${slotId}`);
      const naturallyAvailable = dayHasAvailability && seedValue % 100 < 70;
      return {
        id: slotId,
        label: `${start} - ${end}`,
        start,
        end,
        available: naturallyAvailable && !takenSlotIds.has(slotId),
      };
    }),
  }));
}

export async function isSlotAvailable(dateStr: string, slotId: string, seed: string) {
  const groups = await getSlotsForDate(dateStr, seed);
  const slot = groups.flatMap((g) => g.slots).find((s) => s.id === slotId);
  return !!slot?.available;
}
