export interface WaitlistEntry {
  id: string;
  date: string;
  slotId: string;
  slotLabel: string;
  categoryId: string;
  equipmentId: string;
  equipmentLabel: string;
  status: "WAITING" | "NOTIFIED" | "CONVERTED" | "EXPIRED";
  createdAt: string;
}
