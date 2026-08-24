export type AddressLabel = "Home" | "Business" | "Other";

export interface Address {
  id: string;
  userId: string;
  label: AddressLabel;
  houseNumber: string;
  street: string;
  city: string;
  postcode: string;
  instructions: string;
  isDefault: boolean;
}

export type NotificationType =
  | "booking_received"
  | "booking_confirmed"
  | "appointment_reminder"
  | "technician_assigned"
  | "status_changed"
  | "service_completed"
  | "review_request"
  | "support_response"
  | "welcome";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface Review {
  id: string;
  userId: string;
  bookingReference: string;
  serviceName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export type SupportCategory =
  | "booking_help"
  | "reschedule_help"
  | "cancellation_help"
  | "service_questions"
  | "technical_questions"
  | "general_enquiry";

export interface SupportTicket {
  id: string;
  userId: string | null;
  category: SupportCategory;
  subject: string;
  message: string;
  email: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}
