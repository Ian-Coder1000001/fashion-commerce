"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Coupon from "@/models/Coupon";
import {
  validateAndComputeDiscount,
  type CouponValidationResult,
} from "@/services/coupon.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

/**
 * Called directly from the checkout page's "Apply" button (not tied to a
 * <form action>, just invoked as a normal async function from a client
 * event handler — valid for Server Actions). This is the immediate
 * feedback check; placeOrder() re-validates independently at order time.
 */
export async function applyCouponAction(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  return validateAndComputeDiscount(code, subtotal);
}

export async function listCouponsForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return Coupon.find().sort({ createdAt: -1 }).lean();
}

export interface CouponFormState {
  error?: string;
}

export async function createCouponAction(
  _prevState: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireAdmin();
  await connectToDatabase();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "");
  const value = Number(formData.get("value"));
  const minOrderAmount = formData.get("minOrderAmount")
    ? Number(formData.get("minOrderAmount"))
    : null;
  const maxDiscountAmount = formData.get("maxDiscountAmount")
    ? Number(formData.get("maxDiscountAmount"))
    : null;
  const usageLimit = formData.get("usageLimit")
    ? Number(formData.get("usageLimit"))
    : null;
  const startDate = formData.get("startDate")
    ? new Date(String(formData.get("startDate")))
    : null;
  const endDate = formData.get("endDate")
    ? new Date(String(formData.get("endDate")))
    : null;

  if (!code || !type || !value || value <= 0) {
    return { error: "Code, type, and a positive value are required." };
  }
  if (type === "percentage" && value > 100) {
    return { error: "A percentage discount can't exceed 100." };
  }

  try {
    await Coupon.create({
      code,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return { error: "A coupon with that code already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/coupons");
  return {};
}

export async function toggleCouponActiveAction(couponId: string) {
  await requireAdmin();
  await connectToDatabase();

  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;

  coupon.isActive = !coupon.isActive;
  await coupon.save();
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(couponId: string) {
  await requireAdmin();
  await connectToDatabase();
  await Coupon.findByIdAndDelete(couponId);
  revalidatePath("/admin/coupons");
}