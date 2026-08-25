import type { ServiceCategoryId } from "@/types/service";

export type SubscriptionFrequency = "annual" | "bi-annual" | "quarterly" | "quarterly-bundle";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface SubscriptionPlanPrice {
  amount: number;
  currency: "EUR";
  billingCycleMonths: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: SubscriptionFrequency;
  visitsPerYear: number;
  tagline: string;
  features: string[];
  recommendedFor: string;
  /** Only set for fixed-price package plans; other plans confirm pricing with the customer directly. */
  price?: SubscriptionPlanPrice;
  servicesPerCycle?: number;
  rolloverPolicy?: string;
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
  price: SubscriptionPlanPrice | null;
  servicesPerCycle: number | null;
  couponCode?: string | null;
  originalAmount?: number | null;
  createdAt: string;
  updatedAt: string;
}
