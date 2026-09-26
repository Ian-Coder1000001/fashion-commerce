import Link from "next/link";
import { listCustomersForAdmin } from "@/actions/customer.actions";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await listCustomersForAdmin(q);

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Customers</h1>

      <form className="mb-8 max-w-sm">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or email…"
          className="w-full h-11 border border-border bg-surface px-3 text-sm"
        />
      </form>

      {customers.length === 0 ? (
        <p className="text-sm text-fg-muted">No customers found.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Name</th>
              <th className="py-3 font-normal">Email</th>
              <th className="py-3 font-normal">Orders</th>
              <th className="py-3 font-normal">Total spent</th>
              <th className="py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={String(customer._id)} className="border-b border-border">
                <td className="py-3">
                  <Link href={`/admin/customers/${customer._id}`} className="hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="py-3 text-fg-muted">{customer.email}</td>
                <td className="py-3">{customer.orderCount}</td>
                <td className="py-3">{formatPrice(customer.totalSpent)}</td>
                <td className="py-3 text-fg-muted">
                  {customer.isDisabled ? "Disabled" : "Active"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}