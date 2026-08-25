import type { ServiceCategoryId } from "@/types/service";

export interface Equipment {
  id: string;
  userId: string;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  nickname: string;
  brand: string;
  serialNumber: string;
  installDate: string | null;
  warrantyExpiry: string | null;
  addressId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentInput = Omit<Equipment, "id" | "userId" | "createdAt" | "updatedAt">;
