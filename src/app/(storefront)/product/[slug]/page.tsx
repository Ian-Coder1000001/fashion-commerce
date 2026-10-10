import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product.service";
import { AddToBag } from "@/components/storefront/AddToBag";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { StarRating } from "@/components/storefront/StarRating";
import { ProductReviews } from "@/components/storefront/ProductReviews";
import { auth } from "@/lib/auth";
import { getWishlistProductIds } from "@/services/wishlist.service";
import {
  getReviewsForProduct,
  getReviewEligibility,
} from "@/services/review.service";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.slice(0, 160),
      images: product.images?.[0]?.secureUrl ? [product.images[0].secureUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const productId = String(product._id);
  const [session, wishlistIds, { reviews, summary }, eligibility] =
    await Promise.all([
      auth(),
      getWishlistProductIds(),
      getReviewsForProduct(productId),
      getReviewEligibility(productId),
    ]);

  const onSale =
    typeof product.salePrice === "number" && product.salePrice < product.price;

  const hasVariants = (product.variants ?? []).length > 0;
  const inStock = hasVariants
    ? product.variants.some((v: { stock: number }) => v.stock > 0)
    : product.stockQuantity > 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.map((img: { secureUrl: string }) => img.secureUrl) ?? [],
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.salePrice ?? product.price,
      priceCurrency: product.currency ?? "KES",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average,
            reviewCount: summary.count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div className="lg:pt-4">
          <h1 className="font-display text-h1 mb-3">{product.name}</h1>

          {summary.count > 0 && (
            <a href="#reviews" className="inline-flex items-center gap-2 mb-3">
              <StarRating value={summary.average} />
              <span className="text-xs text-fg-muted underline underline-offset-4">
                {summary.count} review{summary.count === 1 ? "" : "s"}
              </span>
            </a>
          )}

          <p className="text-lg mb-6">
            {onSale ? (
              <>
                <span className="text-primary">
                  {formatPrice(product.salePrice!, product.currency)}
                </span>{" "}
                <span className="text-fg-muted line-through">
                  {formatPrice(product.price, product.currency)}
                </span>
              </>
            ) : (
              formatPrice(product.price, product.currency)
            )}
          </p>

          {product.shortDescription && (
            <p className="text-fg-muted mb-6">{product.shortDescription}</p>
          )}

          <p className="text-sm leading-relaxed text-fg-muted mb-8 whitespace-pre-line">
            {product.description}
          </p>

          <p className="text-xs tracking-wide uppercase text-fg-muted mb-6">
            {hasVariants
              ? inStock
                ? "In stock"
                : "Out of stock"
              : product.stockQuantity > 0
                ? `${product.stockQuantity} in stock`
                : "Out of stock"}
          </p>

          <AddToBag
            productId={productId}
            variants={(product.variants ?? []).map(
              (v: { _id: unknown; size?: string; color?: string; stock: number }) => ({
                id: String(v._id),
                label: [v.size, v.color].filter(Boolean).join(" / ") || "Option",
                stock: v.stock,
              })
            )}
            inStock={inStock}
          />

          <div className="mt-3">
            <WishlistButton
              productId={productId}
              initialSaved={wishlistIds.includes(productId)}
              isLoggedIn={!!session}
            />
          </div>
        </div>
      </div>

      <ProductReviews
        productId={productId}
        productSlug={product.slug}
        reviews={reviews}
        summary={summary}
        eligibility={eligibility}
      />
    </div>
  );
}