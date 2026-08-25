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
