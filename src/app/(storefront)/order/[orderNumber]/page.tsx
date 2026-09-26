import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/services/order.service";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
        Order Confirmed
      </p>
      <h1 className="font-display text-h1 mb-4">Thank you for your order.</h1>
      <p className="text-fg-muted mb-2">Order #{order.orderNumber}</p>
      <p className="text-fg-muted mb-10">
        We&apos;ll send updates to{" "}
        {order.guestEmail ?? "the email on your account"}.
      </p>

      <div className="text-left border border-border p-6 mb-10">
        <div className="flex flex-col gap-3 mb-4">
          {order.items.map(
            (
              item: { name: string; quantity: number; price: number },
              i: number
            ) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-fg-muted">
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {formatPrice(item.price * item.quantity, order.currency)}
                </span>
              </div>
            )
          )}
        </div>
        <div className="border-t border-border pt-4 flex justify-between text-sm font-medium">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>



        <p className="text-xs text-fg-muted mt-4">
  Payment:{" "}
  {order.paymentMethod === "pesapal"
    ? order.paymentMethodDetail
      ? `Pesapal (${order.paymentMethodDetail})`
      : "Pesapal"
    : "Cash on Delivery"}{" "}
  · Status: {order.paymentStatus}
</p>




        {/* <p className="text-xs text-fg-muted mt-4">
          Payment: Cash on Delivery · Status: {order.paymentStatus}
        </p> */}




        <p className="text-xs text-fg-muted mt-1">
          Delivering to {order.shippingAddress.line1},{" "}
          {order.shippingAddress.city}, {order.shippingAddress.country}
        </p>
      </div>

      <Link
        href="/"
        className="inline-block border border-fg px-8 py-3 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}