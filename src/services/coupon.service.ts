import { connectToDatabase } from "@/lib/db";
import Coupon from "@/models/Coupon";

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  error?: string;
  couponId?: string;
}

/**
 * Validates a coupon code against the current subtotal and computes the
 * discount. Called twice in the real flow: once when the customer clicks
 * "Apply" at checkout (for immediate feedback), and again inside
 * placeOrder() right before the order is created — the second call is
 * the one that actually matters, since a client-supplied discount amount
 * is never trusted.
 */
export async function validateAndComputeDiscount(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  await connectToDatabase();

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    return { valid: false, discountAmount: 0, error: "Coupon not found." };
  }
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, error: "This coupon is no longer active." };
  }

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    return { valid: false, discountAmount: 0, error: "This coupon isn't active yet." };
  }
  if (coupon.endDate && now > coupon.endDate) {
    return { valid: false, discountAmount: 0, error: "This coupon has expired." };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, error: "This coupon has reached its usage limit." };
  }
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      error: `This coupon requires a minimum order of ${coupon.minOrderAmount}.`,
    };
  }

  let discount =
    coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;

  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
  discount = Math.min(discount, subtotal); // never discount more than the order itself
  discount = Math.round(discount * 100) / 100;

  return { valid: true, discountAmount: discount, couponId: String(coupon._id) };
}

export async function incrementCouponUsage(couponId: string) {
  await connectToDatabase();
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
}