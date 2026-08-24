import type { SubscriptionPlan } from "@/types/subscription";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "essential-care",
    name: "Essential Care",
    frequency: "annual",
    visitsPerYear: 1,
    tagline: "One thorough annual visit to keep your system compliant and reliable.",
    features: [
      "1 scheduled visit per year",
      "Full safety & performance check",
      "Filter and coil cleaning",
      "Compliance record-keeping",
      "Priority scheduling over one-off bookings",
    ],
    recommendedFor: "Single residential units or low-usage equipment",
  },
  {
    id: "standard-care",
    name: "Standard Care",
    frequency: "bi-annual",
    visitsPerYear: 2,
    tagline: "Two visits a year to catch issues before they become breakdowns.",
    features: [
      "2 scheduled visits per year",
      "Everything in Essential Care",
      "Seasonal readiness checks",
      "Priority emergency response",
      "Dedicated service history",
    ],
    recommendedFor: "Homes, offices and small commercial units",
  },
  {
    id: "complete-care",
    name: "Complete Care",
    frequency: "quarterly",
    visitsPerYear: 4,
    tagline: "Quarterly visits and priority support for equipment you rely on daily.",
    features: [
      "4 scheduled visits per year",
      "Everything in Standard Care",
      "Fastest priority emergency response",
      "Multi-site coordination available",
      "Dedicated account contact",
    ],
    recommendedFor: "Restaurants, retail, and multi-unit commercial sites",
  },
];

export function getPlanById(id: string) {
  return subscriptionPlans.find((p) => p.id === id);
}
