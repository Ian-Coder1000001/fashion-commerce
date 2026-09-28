import { getCurrentUser } from "@/actions/account.actions";
import { getOrdersForCurrentUser } from "@/services/order.service";
import { AccountNav } from "@/components/storefront/AccountNav";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await getOrdersForCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Orders</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <AccountNav />

      {orders.length === 0 ? (
        <p className="text-sm text-fg-muted">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {orders.map((order) => (
            <div key={String(order._id)} className="py-5 flex justify-between text-sm">
              <div>
                <p>{order.orderNumber}</p>
                <p className="text-xs text-fg-muted mt-1">
                  {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-fg-muted">
                  Order: {order.orderStatus} · Payment: {order.paymentStatus}
                </p>
              </div>
              <p>{formatPrice(order.total, order.currency)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}