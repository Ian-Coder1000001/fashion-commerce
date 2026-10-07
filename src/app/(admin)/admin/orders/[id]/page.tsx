import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrderForAdmin,
  updateOrderNotesAction,
  cancelOrderAction,
  updateOrderStatusAction,
} from "@/actions/order.actions";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "delivered", "cancelled", "returned",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "partially_refunded"];
const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);

  if (!order) notFound();

  const populatedUser = order.user as { _id: string; name?: string; email?: string } | null;
  const customerLabel = populatedUser?.name ?? order.guestEmail ?? "Guest";
  const customerEmail = populatedUser?.email ?? order.guestEmail;
  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl mb-1">{order.orderNumber}</h1>
          <p className="text-sm text-fg-muted">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Link
          href={`/admin/orders/${id}/invoice`}
          target="_blank"
          className="text-xs tracking-wide uppercase text-fg-muted hover:text-fg underline underline-offset-4"
        >
          Print Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <section>
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
              Items
            </h2>
            <table className="w-full text-sm border-t border-border">
              <thead>
                <tr className="text-left text-fg-muted border-b border-border">
                  <th className="py-2 font-normal">Item</th>
                  <th className="py-2 font-normal">SKU</th>
                  <th className="py-2 font-normal">Qty</th>
                  <th className="py-2 font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(
                  (
                    item: {
                      name: string;
                      sku: string;
                      quantity: number;
                      price: number;
                      size?: string;
                      color?: string;
                    },
                    i: number
                  ) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3">
                        {item.name}
                        {(item.size || item.color) && (
                          <span className="text-fg-muted">
                            {" "}
                            ({[item.size, item.color].filter(Boolean).join(" / ")})
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-fg-muted">{item.sku}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3 text-right">
                        {formatPrice(item.price * item.quantity, order.currency)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="flex flex-col gap-1 mt-4 max-w-xs ml-auto text-sm">
              <div className="flex justify-between text-fg-muted">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-fg-muted">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-fg-muted">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingFee, order.currency)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
              Shipping Address
            </h2>
            <div className="text-sm text-fg-muted">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ""}{" "}
                {order.shippingAddress.postalCode ?? ""}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1">{order.shippingAddress.phone}</p>
            </div>
          </section>

          <section>
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
              Internal Notes
            </h2>
            <form action={updateOrderNotesAction.bind(null, id)} className="flex flex-col gap-3">
              <textarea
                name="notes"
                defaultValue={order.notes ?? ""}
                rows={3}
                placeholder="Notes visible only to admins — delivery instructions, issues, etc."
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm" className="self-start">
                Save notes
              </Button>
            </form>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section className="border border-border p-5">
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-3">
              Customer
            </h2>
            <p className="text-sm">{customerLabel}</p>
            <p className="text-sm text-fg-muted">{customerEmail}</p>
            {populatedUser && (
              <Link
                href={`/admin/customers/${populatedUser._id}`}
                className="text-xs underline underline-offset-4 text-fg-muted hover:text-fg mt-2 inline-block"
              >
                View customer
              </Link>
            )}
          </section>

          <section className="border border-border p-5">
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-3">
              Payment
            </h2>
            <p className="text-sm text-fg-muted">
              Method:{" "}
              {order.paymentMethod === "pesapal"
                ? order.paymentMethodDetail
                  ? `Pesapal (${order.paymentMethodDetail})`
                  : "Pesapal"
                : "Cash on Delivery"}
            </p>
          </section>

          <section className="border border-border p-5">
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-3">
              Status
            </h2>
            {/* Both statuses in ONE form now — previously these were two
                separate forms, each silently carrying the other field's
                stale value in a hidden input, which could overwrite it
                back to an old value depending on which you saved first. */}
            <form action={updateOrderStatusAction} className="flex flex-col gap-3">
              <input type="hidden" name="orderId" value={id} />
              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-wide text-fg-muted">
                  Payment status
                </label>
                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className="h-9 border border-border bg-surface px-2 text-sm"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-wide text-fg-muted">
                  Order status
                </label>
                <select
                  name="orderStatus"
                  defaultValue={order.orderStatus}
                  className="h-9 border border-border bg-surface px-2 text-sm"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="sm" variant="secondary">
                Save status
              </Button>
            </form>

            {canCancel && (
              <form
                action={cancelOrderAction.bind(null, id)}
                className="mt-4 pt-4 border-t border-border"
              >
                <button type="submit" className="text-xs text-fg-muted hover:text-error">
                  Cancel order &amp; restore stock
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}




// import Link from "next/link";
// import { notFound } from "next/navigation";
// import {
//   getOrderForAdmin,
//   updateOrderNotesAction,
//   cancelOrderAction,
//   updateOrderStatusAction,
// } from "@/actions/order.actions";
// import { Button } from "@/components/ui/Button";

// export const dynamic = "force-dynamic";

// function formatPrice(amount: number, currency = "KES") {
//   return new Intl.NumberFormat("en-KE", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// const ORDER_STATUSES = [
//   "pending",
//   "confirmed",
//   "processing",
//   "packed",
//   "shipped",
//   "delivered",
//   "cancelled",
//   "returned",
// ];
// const PAYMENT_STATUSES = [
//   "pending",
//   "paid",
//   "failed",
//   "refunded",
//   "partially_refunded",
// ];
// const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

// export default async function AdminOrderDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;
//   const order = await getOrderForAdmin(id);

//   if (!order) notFound();

//   const populatedUser = order.user as {
//     _id: string;
//     name?: string;
//     email?: string;
//   } | null;
//   const customerLabel = populatedUser?.name ?? order.guestEmail ?? "Guest";
//   const customerEmail = populatedUser?.email ?? order.guestEmail;
//   const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="font-display text-2xl mb-1">{order.orderNumber}</h1>
//           <p className="text-sm text-fg-muted">
//             {new Date(order.createdAt).toLocaleString()}
//           </p>
//         </div>
//         <Link
//           href={`/admin/orders/${id}/invoice`}
//           target="_blank"
//           className="text-xs tracking-wide uppercase text-fg-muted hover:text-fg underline underline-offset-4"
//         >
//           Print Invoice
//         </Link>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         <div className="lg:col-span-2 flex flex-col gap-10">
//           <section>
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
//               Items
//             </h2>
//             <table className="w-full text-sm border-t border-border">
//               <thead>
//                 <tr className="text-left text-fg-muted border-b border-border">
//                   <th className="py-2 font-normal">Item</th>
//                   <th className="py-2 font-normal">SKU</th>
//                   <th className="py-2 font-normal">Qty</th>
//                   <th className="py-2 font-normal text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {order.items.map(
//                   (
//                     item: {
//                       name: string;
//                       sku: string;
//                       quantity: number;
//                       price: number;
//                       size?: string;
//                       color?: string;
//                     },
//                     i: number,
//                   ) => (
//                     <tr key={i} className="border-b border-border">
//                       <td className="py-3">
//                         {item.name}
//                         {(item.size || item.color) && (
//                           <span className="text-fg-muted">
//                             {" "}
//                             (
//                             {[item.size, item.color]
//                               .filter(Boolean)
//                               .join(" / ")}
//                             )
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 text-fg-muted">{item.sku}</td>
//                       <td className="py-3">{item.quantity}</td>
//                       <td className="py-3 text-right">
//                         {formatPrice(
//                           item.price * item.quantity,
//                           order.currency,
//                         )}
//                       </td>
//                     </tr>
//                   ),
//                 )}
//               </tbody>
//             </table>

//             <div className="flex flex-col gap-1 mt-4 max-w-xs ml-auto text-sm">
//               <div className="flex justify-between text-fg-muted">
//                 <span>Subtotal</span>
//                 <span>{formatPrice(order.subtotal, order.currency)}</span>
//               </div>
//               {order.discountAmount > 0 && (
//                 <div className="flex justify-between text-fg-muted">
//                   <span>
//                     Discount{order.couponCode ? ` (${order.couponCode})` : ""}
//                   </span>
//                   <span>
//                     -{formatPrice(order.discountAmount, order.currency)}
//                   </span>
//                 </div>
//               )}
//               <div className="flex justify-between text-fg-muted">
//                 <span>Shipping</span>
//                 <span>{formatPrice(order.shippingFee, order.currency)}</span>
//               </div>
//               <div className="flex justify-between font-medium pt-1 border-t border-border">
//                 <span>Total</span>
//                 <span>{formatPrice(order.total, order.currency)}</span>
//               </div>
//             </div>
//           </section>

//           <section>
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
//               Shipping Address
//             </h2>
//             <div className="text-sm text-fg-muted">
//               <p>{order.shippingAddress.fullName}</p>
//               <p>{order.shippingAddress.line1}</p>
//               {order.shippingAddress.line2 && (
//                 <p>{order.shippingAddress.line2}</p>
//               )}
//               <p>
//                 {order.shippingAddress.city}
//                 {order.shippingAddress.region
//                   ? `, ${order.shippingAddress.region}`
//                   : ""}{" "}
//                 {order.shippingAddress.postalCode ?? ""}
//               </p>
//               <p>{order.shippingAddress.country}</p>
//               <p className="mt-1">{order.shippingAddress.phone}</p>
//             </div>
//           </section>

//           <section>
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
//               Internal Notes
//             </h2>
//             <form
//               action={updateOrderNotesAction.bind(null, id)}
//               className="flex flex-col gap-3"
//             >
//               <textarea
//                 name="notes"
//                 defaultValue={order.notes ?? ""}
//                 rows={3}
//                 placeholder="Notes visible only to admins — delivery instructions, issues, etc."
//                 className="border border-border bg-surface px-3 py-2 text-sm"
//               />
//               <Button type="submit" size="sm" className="self-start">
//                 Save notes
//               </Button>
//             </form>
//           </section>
//         </div>

//         <div className="flex flex-col gap-8">
//           <section className="border border-border p-5">
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-3">
//               Customer
//             </h2>
//             <p className="text-sm">{customerLabel}</p>
//             <p className="text-sm text-fg-muted">{customerEmail}</p>
//             {populatedUser && (
//               <Link
//                 href={`/admin/customers/${populatedUser._id}`}
//                 className="text-xs underline underline-offset-4 text-fg-muted hover:text-fg mt-2 inline-block"
//               >
//                 View customer
//               </Link>
//             )}
//           </section>

//           <section className="border border-border p-5">
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-3">
//               Payment
//             </h2>
//             <p className="text-sm text-fg-muted mb-1">
//               Method:{" "}
//               {order.paymentMethod === "pesapal"
//                 ? order.paymentMethodDetail
//                   ? `Pesapal (${order.paymentMethodDetail})`
//                   : "Pesapal"
//                 : "Cash on Delivery"}
//             </p>
//             <form
//               action={updateOrderStatusAction}
//               className="flex flex-col gap-2 mt-3"
//             >
//               <input type="hidden" name="orderId" value={id} />
//               <input
//                 type="hidden"
//                 name="orderStatus"
//                 value={order.orderStatus}
//               />
//               <label className="text-xs tracking-wide text-fg-muted">
//                 Payment status
//               </label>
//               <select
//                 name="paymentStatus"
//                 defaultValue={order.paymentStatus}
//                 className="h-9 border border-border bg-surface px-2 text-sm"
//               >
//                 {PAYMENT_STATUSES.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//               <Button type="submit" size="sm" variant="secondary">
//                 Save
//               </Button>
//             </form>
//           </section>

//           <section className="border border-border p-5">
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-3">
//               Order Status
//             </h2>
//             <form
//               action={updateOrderStatusAction}
//               className="flex flex-col gap-2"
//             >
//               <input type="hidden" name="orderId" value={id} />
//               <input
//                 type="hidden"
//                 name="paymentStatus"
//                 value={order.paymentStatus}
//               />
//               <select
//                 name="orderStatus"
//                 defaultValue={order.orderStatus}
//                 className="h-9 border border-border bg-surface px-2 text-sm"
//               >
//                 {ORDER_STATUSES.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//               <Button type="submit" size="sm" variant="secondary">
//                 Save
//               </Button>
//             </form>

//             {canCancel && (
//               <form
//                 action={cancelOrderAction.bind(null, id)}
//                 className="mt-4 pt-4 border-t border-border"
//               >
//                 <button
//                   type="submit"
//                   className="text-xs text-fg-muted hover:text-error"
//                 >
//                   Cancel order &amp; restore stock
//                 </button>
//               </form>
//             )}
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }
