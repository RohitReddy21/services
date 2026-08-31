import type { SubscriptionPlan } from "@/types/subscription";

const planImage = (name: string) => `/images/plans/${name}.svg`;

/**
 * What a single AGS Care Plan service visit covers. Shared across every plan.
 */
export const serviceInclusions: string[] = [
  "Full inspection of the unit",
  "Cleaning the filters",
  "Ductwork airflow check and re-run",
  "Operational test in heating and cooling mode",
  "Gas pressure check at the unit compressor",
  "Free call-out charge included",
];

/**
 * Unused visits at the end of a multi-month term are converted to vouchers.
 */
export const voucherPolicy =
  "Bought a multi-month plan and didn't use every visit? Each service still unused when your term ends is issued to you as a single-service voucher, valid for 1 month. Any voucher not redeemed within that month expires automatically.";

const GBP = "GBP" as const;

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "care-1",
    name: "1-Month Care",
    frequency: "monthly",
    months: 1,
    servicesIncluded: 1,
    visitsPerYear: 12,
    pricePerMonth: 175,
    image: planImage("care-1"),
    price: { amount: 175, currency: GBP, billingCycleMonths: 1 },
    servicesPerCycle: 1,
    tagline: "One full service visit and free call-outs for a single month.",
    features: [
      "1 service visit included",
      "Free call-out charge for the month",
      "Full unit inspection & filter clean",
      "Gas pressure and airflow checks",
      "Priority scheduling over one-off bookings",
    ],
    recommendedFor: "Trying the plan out, or covering one busy month",
  },
  {
    id: "care-2",
    name: "2-Month Care",
    frequency: "monthly",
    months: 2,
    servicesIncluded: 2,
    visitsPerYear: 12,
    pricePerMonth: 164.5,
    image: planImage("care-2"),
    price: { amount: 329, currency: GBP, billingCycleMonths: 2 },
    servicesPerCycle: 2,
    tagline: "Two monthly service visits with free call-outs throughout.",
    features: [
      "2 service visits included (one per month)",
      "Free call-out charge for the whole term",
      "Full unit inspection & filter clean each visit",
      "Gas pressure and airflow checks",
      "Unused visits become a 1-month voucher",
    ],
    recommendedFor: "Short seasonal cover for homes and small units",
  },
  {
    id: "care-3",
    name: "3-Month Care",
    frequency: "monthly",
    months: 3,
    servicesIncluded: 3,
    visitsPerYear: 12,
    pricePerMonth: 166.33,
    image: planImage("care-3"),
    price: { amount: 499, currency: GBP, billingCycleMonths: 3 },
    servicesPerCycle: 3,
    tagline: "A full quarter of monthly servicing with free call-outs.",
    features: [
      "3 service visits included (one per month)",
      "Free call-outs for the full quarter",
      "Full unit inspection & filter clean each visit",
      "Gas pressure and airflow checks",
      "Unused visits become a 1-month voucher",
    ],
    recommendedFor: "Quarterly cover for homes, offices and small commercial units",
  },
  {
    id: "care-6",
    name: "6-Month Care",
    frequency: "monthly",
    months: 6,
    servicesIncluded: 6,
    visitsPerYear: 12,
    pricePerMonth: 149.83,
    addOnMonthlyPrice: 99,
    highlight: true,
    image: planImage("care-6"),
    price: { amount: 899, currency: GBP, billingCycleMonths: 6 },
    servicesPerCycle: 6,
    tagline: "Six monthly visits at a lower monthly rate, with free call-outs.",
    features: [
      "6 service visits included (one per month)",
      "Free call-outs for the full term",
      "Add extra months at just £99/month",
      "Full unit inspection & filter clean each visit",
      "Unused visits become a 1-month voucher",
    ],
    recommendedFor: "Restaurants, retail and equipment you rely on daily",
  },
  {
    id: "care-12",
    name: "12-Month Care",
    frequency: "monthly",
    months: 12,
    servicesIncluded: 12,
    visitsPerYear: 12,
    pricePerMonth: 108.25,
    addOnMonthlyPrice: 99,
    image: planImage("care-12"),
    price: { amount: 1299, currency: GBP, billingCycleMonths: 12 },
    servicesPerCycle: 12,
    tagline: "A full year of monthly servicing at our lowest monthly rate.",
    features: [
      "12 service visits included (one per month)",
      "Free call-outs all year",
      "Add extra months at just £99/month",
      "Full unit inspection & filter clean each visit",
      "Unused visits become a 1-month voucher",
    ],
    recommendedFor: "High-usage commercial sites wanting the best annual value",
  },
];

export function getPlanById(id: string) {
  return subscriptionPlans.find((p) => p.id === id);
}
