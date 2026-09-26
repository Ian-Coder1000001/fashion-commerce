import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import * as pesapal from "@/services/payment/pesapal";

export async function initiatePesapalPayment(orderId: string): Promise<string> {
  await connectToDatabase();
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found.");

  const [firstName, ...rest] = order.shippingAddress.fullName.split(" ");

  const result = await pesapal.submitOrder({
    merchantReference: order.orderNumber,
    amount: order.total,
    currency: order.currency,
    description: `Order ${order.orderNumber}`,
    email: order.guestEmail ?? undefined,
    phone: order.shippingAddress.phone,
    firstName,
    lastName: rest.join(" ") || undefined,
  });

  order.pesapalOrderTrackingId = result.orderTrackingId;
  await order.save();

  return result.redirectUrl;
}

export async function confirmPesapalPayment(orderTrackingId: string) {
  await connectToDatabase();
  const order = await Order.findOne({ pesapalOrderTrackingId: orderTrackingId });
  if (!order) throw new Error("Order not found for this Pesapal transaction.");

  const status = await pesapal.getTransactionStatus(orderTrackingId);

  if (status.statusCode === 1) {
    order.paymentStatus = "paid";
    order.orderStatus = order.orderStatus === "pending" ? "confirmed" : order.orderStatus;
  } else if (status.statusCode === 2) {
    order.paymentStatus = "failed";
  } else if (status.statusCode === 3) {
    order.paymentStatus = "refunded";
  }

  order.paymentMethodDetail = status.paymentMethod ?? order.paymentMethodDetail;
  await order.save();

  return order;
}