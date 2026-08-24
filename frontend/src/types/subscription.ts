import type { ServiceCategoryId } from "@/types/service";

export type SubscriptionFrequency = "annual" | "bi-annual" | "quarterly";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: SubscriptionFrequency;
  visitsPerYear: number;
  tagline: string;
  features: string[];
  recommendedFor: string;
}

export interface SubscriptionAddress {
  houseNumber: string;
  street: string;
  city: string;
  postcode: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  frequency: SubscriptionFrequency;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  status: SubscriptionStatus;
  startDate: string;
  nextVisitDate: string;
  address: SubscriptionAddress;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
