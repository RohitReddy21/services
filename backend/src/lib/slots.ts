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

export function getDayAvailability(_dateStr: string, _seed: string) {
  return true;
}

export async function getSlotsForDate(_dateStr: string, _seed: string): Promise<SlotGroup[]> {
  return PERIODS.map(({ period, times }) => ({
    period,
    slots: times.map(([start, end]) => {
      const slotId = `${period.toLowerCase()}-${start.replace(":", "")}`;
      return {
        id: slotId,
        label: `${start} - ${end}`,
        start,
        end,
        available: true,
      };
    }),
  }));
}

export async function isSlotAvailable(dateStr: string, slotId: string, seed: string) {
  const groups = await getSlotsForDate(dateStr, seed);
  const slot = groups.flatMap((g) => g.slots).find((s) => s.id === slotId);
  return !!slot?.available;
}
