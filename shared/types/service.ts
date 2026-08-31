export type ServiceCategoryId = "air-conditioning" | "refrigeration" | "electrical";

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  slug: ServiceCategoryId;
  shortDescription: string;
  icon: "snowflake" | "fridge" | "bolt";
}

export interface ServiceSummary {
  id: string;
  categoryId: ServiceCategoryId;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

export interface ServiceDetail extends ServiceSummary {
  heroImage: string;
  description: string;
  applications: string[];
  commonProblems: string[];
}

export interface CategoryContent {
  whatWeProvide: string[];
  idealFor: { label: string; icon: "home" | "building" | "store" | "utensils" | "briefcase" }[];
  process: { step: number; title: string; description: string }[];
  faqs: ServiceFAQ[];
  reviews: ServiceReview[];
}

export type RequirementType =
  | "installation"
  | "repair"
  | "servicing"
  | "maintenance"
  | "replacement"
  | "diagnostics"
  | "emergency"
  | "other";

export type BookingStatus =
  | "BOOKING_RECEIVED"
  | "CONFIRMED"
  | "TECHNICIAN_ASSIGNED"
  | "TECHNICIAN_ARRIVING"
  | "SERVICE_STARTED"
  | "COMPLETED"
  | "CANCELLED";
