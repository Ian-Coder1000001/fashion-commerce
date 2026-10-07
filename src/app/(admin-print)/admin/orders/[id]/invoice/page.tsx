import { notFound } from "next/navigation";
import { getOrderForAdmin } from "@/actions/order.actions";
import { getStoreSettings } from "@/services/settings.service";
import { PrintButton } from "@/components/admin/PrintButton";



function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrderForAdmin(id),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-8 py-12 text-fg bg-bg">
      <div className="flex justify-between items-start mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="font-display text-2xl mb-1">
            {settings.storeName ?? "Store"}
          </h1>
          {settings.address && (
            <p className="text-sm text-fg-muted">{settings.address}</p>
          )}
          {settings.contactEmail && (
            <p className="text-sm text-fg-muted">{settings.contactEmail}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs tracking-wide uppercase text-fg-muted">Invoice</p>
          <p className="text-sm">{order.orderNumber}</p>
          <p className="text-sm text-fg-muted">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-2">
            Billed To
          </p>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>
            {order.shippingAddress.city}
            {order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ""}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-2">
            Payment
          </p>
          <p>
            {order.paymentMethod === "pesapal" ? "Pesapal" : "Cash on Delivery"}
          </p>
          <p className="text-fg-muted">Status: {order.paymentStatus}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-10">
        <thead>
          <tr className="text-left border-b border-fg">
            <th className="py-2 font-normal">Item</th>
            <th className="py-2 font-normal text-right">Qty</th>
            <th className="py-2 font-normal text-right">Price</th>
            <th className="py-2 font-normal text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(
            (
              item: { name: string; quantity: number; price: number },
              i: number
            ) => (
              <tr key={i} className="border-b border-border">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">
                  {formatPrice(item.price, order.currency)}
                </td>
                <td className="py-2 text-right">
                  {formatPrice(item.price * item.quantity, order.currency)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="flex flex-col gap-1 max-w-xs ml-auto text-sm mb-12">
        <div className="flex justify-between text-fg-muted">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal, order.currency)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-fg-muted">
            <span>Discount</span>
            <span>-{formatPrice(order.discountAmount, order.currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-fg-muted">
          <span>Shipping</span>
          <span>{formatPrice(order.shippingFee, order.currency)}</span>
        </div>
        <div className="flex justify-between font-medium text-base pt-2 border-t border-fg">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>
      </div>

            <PrintButton />
    </div>
  );
}