interface SalesChartProps {
  daily: { key: string; revenue: number; orders: number }[];
  currency: string;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDay(key: string) {
  return new Date(`${key}T12:00:00+03:00`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Nairobi",
  });
}

export function SalesChart({ daily, currency }: SalesChartProps) {
  const max = Math.max(...daily.map((d) => d.revenue), 0);

  if (max === 0) {
    return (
      <p className="text-sm text-fg-muted">
        No paid sales in this period yet. Orders appear here once their payment
        status is Paid.
      </p>
    );
  }

  const width = 600;
  const height = 140;
  const slot = width / daily.length;
  const barWidth = Math.min(slot * 0.7, 28);
  const total = daily.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div>
      <p className="text-xs text-fg-muted mb-3">
        Highest day: {formatMoney(max, currency)}
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Daily revenue from ${formatDay(daily[0].key)} to ${formatDay(
          daily[daily.length - 1].key,
        )}, ${formatMoney(total, currency)} in total.`}
      >
        {daily.map((d, i) => {
          const barHeight =
            d.revenue > 0 ? Math.max(2, (d.revenue / max) * height) : 1;
          return (
            <rect
              key={d.key}
              x={i * slot + (slot - barWidth) / 2}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              className={d.revenue > 0 ? "fill-primary" : "fill-border"}
            >
              <title>{`${formatDay(d.key)}: ${formatMoney(d.revenue, currency)} from ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
            </rect>
          );
        })}
      </svg>

      <div className="flex justify-between text-xs text-fg-muted mt-2">
        <span>{formatDay(daily[0].key)}</span>
        <span>{formatDay(daily[daily.length - 1].key)}</span>
      </div>
    </div>
  );
}
