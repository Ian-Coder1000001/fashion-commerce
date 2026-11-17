import Link from "next/link";
import { listOrdersForAdmin } from "@/actions/order.actions";

export const dynamic = "force-dynamic";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOrdersPage() {
  const orders = await listOrdersForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-fg-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-t border-border">
            <thead>
              <tr className="text-left text-fg-muted border-b border-border">
                <th className="py-3 pr-4 font-normal">Order #</th>
                <th className="py-3 pr-4 font-normal">Customer</th>
                <th className="py-3 pr-4 font-normal">Date</th>
                <th className="py-3 pr-4 font-normal">Total</th>
                <th className="py-3 pr-4 font-normal">Payment</th>
                <th className="py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customerLabel =
                  (order.user as { name?: string } | null)?.name ??
                  order.guestEmail ??
                  "Guest";

                return (
                  <tr key={String(order._id)} className="border-b border-border">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-fg-muted">{customerLabel}</td>
                    <td className="py-3 pr-4 text-fg-muted whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {formatPrice(order.total, order.currency)}
                    </td>
                    <td className="py-3 pr-4 text-fg-muted">{order.paymentStatus}</td>
                    <td className="py-3 text-fg-muted">{order.orderStatus}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}