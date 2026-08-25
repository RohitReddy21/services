import { Coupon } from "../models/Coupon";

export async function findValidCoupon(code: string) {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return { error: "Coupon code not found." } as const;
  if (!coupon.active) return { error: "This coupon is no longer active." } as const;
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { error: "This coupon has expired." } as const;
  }
  if (coupon.maxRedemptions != null && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { error: "This coupon has reached its redemption limit." } as const;
  }
  return { coupon } as const;
}

export function applyDiscount(amount: number, coupon: { discountType: string; discountValue: number }) {
  const discounted =
    coupon.discountType === "PERCENT"
      ? amount * (1 - coupon.discountValue / 100)
      : amount - coupon.discountValue;
  return Math.max(0, Math.round(discounted * 100) / 100);
}
