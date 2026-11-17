import Link from "next/link";
import { getDashboardData } from "@/actions/dashboard.actions";
import { SalesChart } from "@/components/admin/SalesChart";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90];

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Nairobi",
  });
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-surface group-hover:bg-bg p-5 h-full">
      <p className="text-xs text-fg-muted mb-2">{label}</p>
      <p className="font-display text-3xl break-words">{value}</p>
      {sub && <p className="text-xs text-fg-muted mt-2">{sub}</p>}
    </div>
  );

  return href ? (
    <Link href={href} className="group block">
      {inner}
    </Link>
  ) : (
    <div className="group">{inner}</div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const requested = Number(range);
  const data = await getDashboardData(Number.isFinite(requested) ? requested : 30);
  const { currency } = data;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <nav aria-label="Date range" className="flex gap-4 text-xs">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              aria-current={r === data.rangeDays ? "true" : undefined}
              className={
                r === data.rangeDays
                  ? "text-fg underline underline-offset-4"
                  : "text-fg-muted hover:text-fg"
              }
            >
              Last {r} days
            </Link>
          ))}
        </nav>
      </div>

      {data.unreadMessages > 0 && (
        <Link
          href="/admin/messages"
          className="block border border-border bg-surface px-4 py-3 text-sm mb-6 hover:border-fg"
        >
          You have {data.unreadMessages} unread message
          {data.unreadMessages === 1 ? "" : "s"}.
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border mb-10">
        <StatCard
          label={`Revenue, last ${data.rangeDays} days`}
          value={formatMoney(data.revenue, currency)}
          sub="Paid orders only"
        />
        <StatCard
          label={`Orders, last ${data.rangeDays} days`}
          value={data.orderCount}
          sub={`${data.openOrders} awaiting fulfilment`}
          href="/admin/orders"
        />
        <StatCard
          label="Customers"
          value={data.customerCount}
          sub={`${data.newCustomers} new in this period`}
          href="/admin/customers"
        />
        <StatCard
          label="Products"
          value={data.publishedCount}
          sub={`${data.productCount} in total, including drafts`}
          href="/admin/products"
        />
        <StatCard
          label="Pending payments"
          value={data.pendingPayments.count}
          sub={`${formatMoney(data.pendingPayments.amount, currency)} not yet collected`}
          href="/admin/orders"
        />
        <StatCard
          label="Low stock"
          value={data.lowStockCount}
          sub="Published products at or below their threshold"
        />
      </div>

      <section className="mb-12">
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Sales overview
        </h2>
        <SalesChart daily={data.daily} currency={currency} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Top products
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-fg-muted">No sales in this period yet.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {data.topProducts.map((p) => (
                <li
                  key={p.productId}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  {p.exists ? (
                    <Link
                      href={`/admin/products/${p.productId}`}
                      className="hover:underline min-w-0 truncate"
                    >
                      {p.name}
                    </Link>
                  ) : (
                    <span className="min-w-0 truncate text-fg-muted">
                      {p.name} (deleted)
                    </span>
                  )}
                  <span className="text-right shrink-0">
                    <span className="block">{p.sold} sold</span>
                    <span className="block text-xs text-fg-muted">
                      {formatMoney(p.revenue, currency)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-fg-muted mt-2">
            Ranked by units sold, excluding cancelled and returned orders.
          </p>
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Low stock
          </h2>
          {data.lowStockItems.length === 0 ? (
            <p className="text-sm text-fg-muted">Nothing is running low.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {data.lowStockItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/products/${item.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-surface"
                  >
                    <span className="min-w-0 truncate">{item.name}</span>
                    <span
                      className={`text-xs text-right shrink-0 ${
                        item.out ? "text-error" : "text-fg-muted"
                      }`}
                    >
                      {item.out ? "Out of stock · " : ""}
                      {item.detail}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Recent orders
          </h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-fg-muted">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {data.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block">{o.orderNumber}</span>
                      <span className="block text-xs text-fg-muted truncate">
                        {o.customer} · {formatShortDate(o.createdAt)}
                      </span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block">{formatMoney(o.total, currency)}</span>
                      <span className="block text-xs text-fg-muted">
                        {o.paymentStatus} · {o.orderStatus}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Recent customers
          </h2>
          {data.recentCustomers.length === 0 ? (
            <p className="text-sm text-fg-muted">No customers yet.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {data.recentCustomers.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{c.name}</span>
                      <span className="block text-xs text-fg-muted truncate">
                        {c.email}
                      </span>
                    </span>
                    <span className="text-xs text-fg-muted shrink-0">
                      {formatShortDate(c.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}