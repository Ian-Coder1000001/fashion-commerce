"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { restoreStock } from "@/services/order.service";
import { sendOrderStatusEmail } from "@/services/order-email.service";

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
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
] as const;

export async function getOrderForAdmin(orderId: string) {
  await requireAdmin();
  await connectToDatabase();
  return Order.findById(orderId).populate("user", "name email").lean();
}

export async function updateOrderNotesAction(orderId: string, formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const notes = String(formData.get("notes") ?? "");
  await Order.findByIdAndUpdate(orderId, { notes });
  revalidatePath(`/admin/orders/${orderId}`);
}

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

export async function cancelOrderAction(orderId: string) {
  await requireAdmin();
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) return;

  if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    throw new Error(
      "This order can no longer be cancelled — it's already been shipped, delivered, or cancelled."
    );
  }

  const failedRestorations: string[] = [];
  for (const item of order.items) {
    const restored = await restoreStock(
      String(item.product),
      item.variantId ? String(item.variantId) : null,
      item.quantity
    );
    if (!restored) {
      failedRestorations.push(`${item.name} (${item.sku})`);
    }
    revalidatePath(`/admin/products/${item.product}`);
  }

  order.orderStatus = "cancelled";
  if (failedRestorations.length > 0) {
    const warning = `⚠ Stock could not be automatically restored for: ${failedRestorations.join(", ")}. This usually means the product's variant was edited or removed after this order was placed — adjust stock manually if needed.`;
    order.notes = order.notes ? `${order.notes}\n\n${warning}` : warning;
  }
  await order.save();

  await sendOrderStatusEmail(order, "cancelled");

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export interface OrderStatusState {
  error?: string;
  savedOrderStatus?: string;
  savedPaymentStatus?: string;
}

export async function saveOrderStatusAction(
  orderId: string,
  _prevState: OrderStatusState,
  formData: FormData
): Promise<OrderStatusState> {
  await requireAdmin();
  await connectToDatabase();

  const orderStatus = String(formData.get("orderStatus"));
  const paymentStatus = String(formData.get("paymentStatus"));

  if (!ORDER_STATUSES.includes(orderStatus as (typeof ORDER_STATUSES)[number])) {
    return { error: "Invalid order status." };
  }
  if (!PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
    return { error: "Invalid payment status." };
  }

  const current = await Order.findById(orderId).select("orderStatus");
  if (!current) return { error: "Order not found." };

  if (current.orderStatus === "cancelled" && orderStatus !== "cancelled") {
    return { error: "This order was cancelled and can't be changed." };
  }
  if (orderStatus === "cancelled" && current.orderStatus !== "cancelled") {
    return {
      error:
        "To cancel an order, use “Cancel order & restore stock” below so the stock is returned.",
    };
  }

  // { new: true } returns the document as it is AFTER the write, so the
  // confirmation shown to the admin reflects what the database really holds.
  const updated = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus, paymentStatus },
    { new: true }
  );
  if (!updated) return { error: "Order not found." };

  if (updated.orderStatus !== current.orderStatus) {
    await sendOrderStatusEmail(updated, updated.orderStatus);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return {
    savedOrderStatus: updated.orderStatus,
    savedPaymentStatus: updated.paymentStatus,
  };
}