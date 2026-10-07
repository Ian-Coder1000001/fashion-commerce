import {
  listOrdersForAdmin,
  updateOrderStatusAction,
} from "@/actions/order.actions";

import Link from "next/link";


export const dynamic = "force-dynamic";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
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
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

export default async function AdminOrdersPage() {
  const orders = await listOrdersForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-fg-muted">No orders yet.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Order #</th>
              <th className="py-3 font-normal">Customer</th>
              <th className="py-3 font-normal">Total</th>
              <th className="py-3 font-normal">Payment</th>
              <th className="py-3 font-normal">Status</th>
              <th className="py-3 font-normal w-24"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const customerLabel =
                (order.user as { name?: string } | null)?.name ??
                order.guestEmail ??
                "Guest";

              return (
                <tr
                  key={String(order._id)}
                  className="border-b border-border align-top"
                >
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-fg-muted">{customerLabel}</td>
                  <td className="py-3">
                    {formatPrice(order.total, order.currency)}
                  </td>
                  <td className="py-3">
                    <form
                      action={updateOrderStatusAction}
                      className="flex flex-col gap-2"
                    >
                      <input
                        type="hidden"
                        name="orderId"
                        value={String(order._id)}
                      />
                      <input
                        type="hidden"
                        name="orderStatus"
                        value={order.orderStatus}
                      />
                      <select
                        name="paymentStatus"
                        defaultValue={order.paymentStatus}
                        className="h-8 border border-border bg-surface px-2 text-xs"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button className="text-xs text-fg-muted hover:text-fg text-left">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <form
                      action={updateOrderStatusAction}
                      className="flex flex-col gap-2"
                    >
                      <input
                        type="hidden"
                        name="orderId"
                        value={String(order._id)}
                      />
                      <input
                        type="hidden"
                        name="paymentStatus"
                        value={order.paymentStatus}
                      />
                      <select
                        name="orderStatus"
                        defaultValue={order.orderStatus}
                        className="h-8 border border-border bg-surface px-2 text-xs"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button className="text-xs text-fg-muted hover:text-fg text-left">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="py-3 text-xs text-fg-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
