import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import * as pesapal from "@/services/payment/pesapal";
import { sendEmail } from "@/lib/email";

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

  // Captured before mutating — this is what lets us tell "payment just
  // confirmed" apart from "payment was already confirmed by the other
  // caller" (IPN and the callback page both call this function for the
  // same payment; without this check the confirmation email would send
  // twice).
  const wasAlreadyPaid = order.paymentStatus === "paid";

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

  if (status.statusCode === 1 && !wasAlreadyPaid) {
    const recipientEmail = order.user
      ? (await User.findById(order.user).select("email").lean())?.email
      : order.guestEmail;

    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Payment Confirmed — ${order.orderNumber}`,
        html: `
          <h2>Payment received</h2>
          <p>We've confirmed your payment for order #${order.orderNumber}.</p>
          <p><strong>Amount paid:</strong> ${order.currency} ${order.total.toLocaleString()}</p>
          <p><strong>Payment method:</strong> Pesapal${order.paymentMethodDetail ? ` (${order.paymentMethodDetail})` : ""}</p>
          <p>We're preparing your order now.</p>
        `,
      });
    }
  }

  return order;
}