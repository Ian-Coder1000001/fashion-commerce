import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  currency?: string;
  imageUrl?: string;
}

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({
  name,
  slug,
  price,
  salePrice,
  currency,
  imageUrl,
}: ProductCardProps) {
  const onSale = typeof salePrice === "number" && salePrice < price;

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-surface border border-border overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-fg-muted tracking-wide">
              Image coming soon
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-sm text-fg">{name}</h3>
      </div>
      <p className="mt-1 text-sm">
        {onSale ? (
          <>
            <span className="text-error">{formatPrice(salePrice!, currency)}</span>{" "}
            <span className="text-fg-muted line-through">
              {formatPrice(price, currency)}
            </span>
          </>
        ) : (
          <span className="text-fg-muted">{formatPrice(price, currency)}</span>
        )}
      </p>
    </Link>
  );
}