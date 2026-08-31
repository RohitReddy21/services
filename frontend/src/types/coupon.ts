export type DiscountType = "PERCENT" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  active: boolean;
  expiresAt: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN" | "TECHNICIAN";
  loyaltyPoints: number;
  referralCode: string;
  createdAt: string;
}

export interface AdminRecentBooking {
  id: string;
  bookingReference: string;
  status: string;
  equipmentLabel: string;
  date: string;
  createdAt: string;
  customer?: { fullName?: string; email?: string };
}

export interface AdminOpenTicket {
  id: string;
  subject: string;
  category: string;
  email: string;
  createdAt: string;
}

export interface AdminStats {
  bookings: { total: number; byStatus: Record<string, number> };
  subscriptions: { active: number; paused: number; cancelled: number; monthlyRevenue: number };
  tickets: { open: number; total: number };
  users: { total: number; admins: number };
  reviews: { count: number; avgRating: number };
  coupons: { active: number; total: number };
  recentBookings: AdminRecentBooking[];
  openTickets: AdminOpenTicket[];
}
