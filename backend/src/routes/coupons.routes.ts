import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { applyDiscount, findValidCoupon } from "../lib/coupons";

export const couponsRouter = Router();
couponsRouter.use(requireAuth);

const validateSchema = z.object({
  code: z.string().trim().min(1),
  amount: z.number().positive(),
});

couponsRouter.post("/validate", async (req, res) => {
  const { code, amount } = validateSchema.parse(req.body);

  const result = await findValidCoupon(code);
  if ("error" in result) throw new ApiError(400, result.error ?? "Invalid coupon code.");

  const discountedAmount = applyDiscount(amount, result.coupon);
  res.json({
    code: result.coupon.code,
    discountType: result.coupon.discountType,
    discountValue: result.coupon.discountValue,
    originalAmount: amount,
    discountedAmount,
  });
});
