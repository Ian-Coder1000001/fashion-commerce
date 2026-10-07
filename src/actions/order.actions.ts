"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

import { restoreStock } from "@/services/order.service";

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

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}







// export async function cancelOrderAction(orderId: string) {
//   await requireAdmin();
//   await connectToDatabase();

//   const order = await Order.findById(orderId);
//   if (!order) return;

//   if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
//     throw new Error(
//       "This order can no longer be cancelled — it's already been shipped, delivered, or cancelled."
//     );
//   }

//   // Restore every item's stock — cancelling an order should give the
//   // inventory back, same principle as the checkout rollback when a
//   // Pesapal payment fails partway through.
//   for (const item of order.items) {
//     await restoreStock(
//       String(item.product),
//       item.variantId ? String(item.variantId) : null,
//       item.quantity
//     );
//   }

//   order.orderStatus = "cancelled";
//   await order.save();

//   revalidatePath(`/admin/orders/${orderId}`);
//   revalidatePath("/admin/orders");
// }