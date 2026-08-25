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
  {
    id: "premium-care",
    name: "Premium Care",
    frequency: "quarterly-bundle",
    visitsPerYear: 12,
    price: { amount: 500, currency: "EUR", billingCycleMonths: 3 },
    servicesPerCycle: 3,
    rolloverPolicy:
      "Any of the 3 services not used within the 3-month period automatically roll over and are added to your next 3-month subscription cycle — you never lose a paid-for visit.",
    tagline: "3 services every 3 months for €500, with unused visits rolled over automatically.",
    features: [
      "3 services included every 3-month cycle",
      "Unused services automatically roll over to the next cycle",
      "Everything in Complete Care",
      "Fixed package price: €500 per 3 months",
      "Dedicated account contact",
    ],
    recommendedFor: "High-usage commercial sites that want predictable, bundled pricing",
  },
];

export function getPlanById(id: string) {
  return subscriptionPlans.find((p) => p.id === id);
}
