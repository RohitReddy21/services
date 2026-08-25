import { API_BASE_URL } from "@/lib/api/api-base";

export interface CouponValidationResult {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  originalAmount: number;
  discountedAmount: number;
}

export function validateCouponRequest(code: string, amount: number) {
  return fetch(`${API_BASE_URL}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, amount }),
  }).then(async (res) => {
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Invalid coupon code.");
    return body as CouponValidationResult;
  });
}
