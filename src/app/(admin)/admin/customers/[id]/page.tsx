import { notFound } from "next/navigation";
import {
  getCustomerDetailForAdmin,
  toggleCustomerDisabledAction,
} from "@/actions/customer.actions";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/types/address";


export const dynamic = "force-dynamic";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { customer, orders } = await getCustomerDetailForAdmin(id);

  if (!customer) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl">{customer.name}</h1>
        <form action={toggleCustomerDisabledAction.bind(null, id)}>
          <Button type="submit" size="sm" variant={customer.isDisabled ? "primary" : "danger"}>
            {customer.isDisabled ? "Enable account" : "Disable account"}
          </Button>
        </form>
      </div>
      <p className="text-fg-muted mb-10">{customer.email}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Addresses
          </h2>
          {(customer.addresses?.length ?? 0) === 0 ? (
            <p className="text-sm text-fg-muted">No saved addresses.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {customer.addresses.map((addr: Address) => (
                <div key={addr._id} className="border border-border p-4 text-sm">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.city}, {addr.country}
                  </p>
                  {addr.phone && <p className="text-fg-muted mt-1">{addr.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Orders ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-sm text-fg-muted">No orders yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border border-y border-border">
              {orders.map((order) => (
                <div key={String(order._id)} className="py-3 flex justify-between text-sm">
                  <div>
                    <p>{order.orderNumber}</p>
                    <p className="text-xs text-fg-muted">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.orderStatus}
                    </p>
                  </div>
                  <p>{formatPrice(order.total, order.currency)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}