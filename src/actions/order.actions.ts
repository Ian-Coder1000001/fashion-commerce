"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function listOrdersForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .limit(100)
    .lean();
}

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "delivered", "cancelled", "returned",
] as const;

const PAYMENT_STATUSES = [
  "pending", "paid", "failed", "refunded", "partially_refunded",
] as const;

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const orderId = String(formData.get("orderId"));
  const orderStatus = String(formData.get("orderStatus"));
  const paymentStatus = String(formData.get("paymentStatus"));

  if (!ORDER_STATUSES.includes(orderStatus as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Invalid order status.");
  }
  if (!PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
    throw new Error("Invalid payment status.");
  }

  await Order.findByIdAndUpdate(orderId, { orderStatus, paymentStatus });
  revalidatePath("/admin/orders");
}