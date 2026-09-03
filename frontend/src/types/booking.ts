import type { BookingStatus, RequirementType, ServiceCategoryId } from "@/types/service";

export interface EquipmentOption {
  id: string;
  label: string;
}

export interface RequirementOption {
  id: RequirementType;
  label: string;
  description: string;
}

export interface UploadedPhoto {
  id: string;
  name: string;
  /** Local object URL — used for instant preview, not sent to the backend. */
  previewUrl: string;
  /** Real backend-hosted URL, set once the upload completes successfully. */
  remoteUrl: string | null;
  status: "uploading" | "done" | "error";
  progress: number;
}

export type ContactMethod = "phone" | "email" | "sms";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  preferredContact: ContactMethod;
}

export interface ServiceAddress {
  houseNumber: string;
  street: string;
  city: string;
  postcode: string;
  instructions: string;
  saveAddress: boolean;
  setDefault: boolean;
}

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  available: boolean;
}

export interface SlotGroup {
  period: "Morning" | "Afternoon" | "Evening";
  slots: TimeSlot[];
}

export interface DayAvailability {
  date: string;
  hasAvailability: boolean;
}

export interface BookingFormData {
  categoryId: ServiceCategoryId | null;
  equipmentId: string | null;
  equipmentLabel: string | null;
  requirement: RequirementType | null;
  description: string;
  photos: UploadedPhoto[];
  date: string | null;
  timeSlot: TimeSlot | null;
  customer: CustomerDetails;
  address: ServiceAddress;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  at: string;
}

/** The assigned engineer's public track record, shown to the customer. */
export interface EngineerCard {
  name: string;
  phone: string | null;
  profileImage: string | null;
  avgRating: number | null;
  reviewCount: number;
  jobsCompleted: number;
}

export interface BookingRecord {
  bookingReference: string;
  status: BookingStatus;
  customerId: string | null;
  data: BookingFormData;
  statusHistory: StatusHistoryEntry[];
  rescheduleRequested: boolean;
  rescheduleNote: string | null;
  technicianId?: string | null;
  technicianName: string | null;
  technicianPhone: string | null;
  /** Filled in by the engineer when they close the job on site. */
  completionNotes?: string;
  completionPhotos?: { name: string; url: string }[];
  completedAt?: string | null;
  /** Raised by the engineer when a visit can't be finished. */
  issueNote?: string | null;
  issueReportedAt?: string | null;
  /** Present on the single-booking lookup when an engineer is assigned. */
  engineer?: EngineerCard | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const emptyBookingForm: BookingFormData = {
  categoryId: null,
  equipmentId: null,
  equipmentLabel: null,
  requirement: null,
  description: "",
  photos: [],
  date: null,
  timeSlot: null,
  customer: {
    fullName: "",
    email: "",
    phone: "",
    preferredContact: "phone",
  },
  address: {
    houseNumber: "",
    street: "",
    city: "",
    postcode: "",
    instructions: "",
    saveAddress: false,
    setDefault: false,
  },
};
