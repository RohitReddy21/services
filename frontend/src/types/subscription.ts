import type { ServiceCategoryId } from "@/types/service";

export type SubscriptionFrequency =
  | "monthly"
  | "annual"
  | "bi-annual"
  | "quarterly"
  | "quarterly-bundle";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface SubscriptionPlanPrice {
  amount: number;
  currency: "GBP";
  billingCycleMonths: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: SubscriptionFrequency;
  visitsPerYear: number;
  /** Length of the plan term in months. */
  months: number;
  /** Number of services covered across the whole term (one per month). */
  servicesIncluded: number;
  /** Fixed price for the full term, expressed per calendar month. */
  pricePerMonth: number;
  /** Per-month rate to extend the plan once the term ends (longer plans only). */
  addOnMonthlyPrice?: number;
  /** Unique illustration for this plan. */
  image: string;
  /** Visually featured on the pricing grid. */
  highlight?: boolean;
  tagline: string;
  features: string[];
  recommendedFor: string;
  /** Fixed price for the full term. */
  price: SubscriptionPlanPrice;
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
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
