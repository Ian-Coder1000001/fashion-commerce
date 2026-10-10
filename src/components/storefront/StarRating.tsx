export function StarRating({
  value,
  size = "text-sm",
}: {
  value: number;
  size?: string;
}) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className={`${size} tracking-wider text-primary whitespace-nowrap`}
    >
      {"★".repeat(rounded)}
      <span className="text-border">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}